import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import {
  useGetTodayEntry,
  useCreateEntry,
  getGetTodayEntryQueryKey,
  getListEntriesQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { StarRating } from "@/components/StarRating";
import { getStarColor } from "@/constants/colors";

type Step = "stars" | "good" | "improvement" | "done";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("stars");
  const [stars, setStars] = useState(0);
  const [good1, setGood1] = useState("");
  const [good2, setGood2] = useState("");
  const [improvement, setImprovement] = useState("");
  const [skipped, setSkipped] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { data: todayEntry, isLoading, error } = useGetTodayEntry({
    query: { retry: false },
  });

  const createEntry = useCreateEntry({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTodayEntryQueryKey() });
        qc.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        Animated.sequence([
          Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        transitionTo("done");
      },
    },
  });

  const transitionTo = (next: Step) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleStarNext = () => {
    if (stars === 0) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    transitionTo("good");
  };

  const bannedWords = ["nothing", "none", "n/a", "na", "nil", "null", "nope", "no"];
  const isBanned = (s: string) => {
    const normalized = s.trim().toLowerCase().replace(/[^a-z0-9/]/g, "");
    return bannedWords.some(bw => normalized === bw);
  };
  const inputError = (() => {
    if (!good1.trim() || !good2.trim()) return null;
    if (good1.trim().length < 3 || good2.trim().length < 3) return "Each entry must be at least 3 characters";
    if (isBanned(good1) || isBanned(good2)) return "Please write something meaningful";
    return null;
  })();

  const handleGoodNext = () => {
    if (!good1.trim() || !good2.trim() || inputError) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    transitionTo("improvement");
  };

  const handleSkipImprovement = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkipped(true);
    submitEntry(true);
  };

  const handleSubmit = () => {
    submitEntry(false);
  };

  const submitEntry = (skip: boolean) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createEntry.mutate({
      data: {
        stars,
        goodInput1: good1.trim(),
        goodInput2: good2.trim(),
        improvementInput: skip ? null : improvement.trim() || null,
        skippedImprovement: skip,
      },
    });
  };

  const topPadding = Platform.OS === "web" ? 67 + 24 : insets.top + 24;

  // Loading
  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: "#0C0C14" }]}>
        <ActivityIndicator color="#5E72EB" size="large" />
      </View>
    );
  }

  // Already has today's entry
  const hasEntry = todayEntry && !error;
  if (hasEntry) {
    const starColor = getStarColor(todayEntry.stars);
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.doneContent, { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 20 : insets.bottom + 20 }]}
      >
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>

        <View style={[styles.scoreCard, { borderColor: starColor + "40" }]}>
          <View style={[styles.scoreBadge, { backgroundColor: starColor }]}>
            <Text style={styles.scoreBadgeText}>{todayEntry.stars}★</Text>
          </View>
          <Text style={styles.scoreLabel}>Today's score</Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputCardTitle}>What was good</Text>
          <Text style={styles.inputCardValue}>"{todayEntry.goodInput1}"</Text>
          <View style={styles.divider} />
          <Text style={styles.inputCardValue}>"{todayEntry.goodInput2}"</Text>
        </View>

        {todayEntry.improvementInput && (
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>Room to grow</Text>
            <Text style={styles.inputCardValue}>"{todayEntry.improvementInput}"</Text>
          </View>
        )}
        {todayEntry.skippedImprovement && (
          <View style={[styles.inputCard, { backgroundColor: "#1A2A1A" }]}>
            <Text style={[styles.inputCardTitle, { color: "#4CD964" }]}>This day was fine</Text>
          </View>
        )}

        <Text style={styles.doneMessage}>
          You already journaled for today. Good job!
        </Text>
      </ScrollView>
    );
  }

  // Entry wizard
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.wizardContent, { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 40 : insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Text style={styles.dateText}>{formatDate(new Date())}</Text>

      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        {(["stars", "good", "improvement"] as Step[]).map((s, i) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              (step === "good" && i === 0) || (step === "improvement" && i <= 1)
                ? styles.stepDotDone
                : null,
              step === "done" && styles.stepDotDone,
            ]}
          />
        ))}
      </View>

      <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
        {step === "stars" && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How was today?</Text>
            <Text style={styles.stepSubtitle}>Tap a star to rate your day</Text>
            <View style={styles.starsContainer}>
              <StarRating value={stars} onChange={setStars} size={58} />
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, stars === 0 && styles.nextBtnDisabled]}
              onPress={handleStarNext}
              disabled={stars === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "good" && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What was good about today?</Text>
            <Text style={styles.stepSubtitle}>Name two things. They can be small.</Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                value={good1}
                onChangeText={setGood1}
                placeholder="First good thing..."
                placeholderTextColor="#5A5A72"
                multiline
                maxLength={200}
              />
              <TextInput
                style={styles.textInput}
                value={good2}
                onChangeText={setGood2}
                placeholder="Second good thing..."
                placeholderTextColor="#5A5A72"
                multiline
                maxLength={200}
              />
            </View>

            {inputError && (
              <Text style={styles.errorText}>{inputError}</Text>
            )}

            <TouchableOpacity
              style={[styles.nextBtn, (!good1.trim() || !good2.trim() || !!inputError) && styles.nextBtnDisabled]}
              onPress={handleGoodNext}
              disabled={!good1.trim() || !good2.trim() || !!inputError}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "improvement" && (
          <View style={styles.stepContent}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkipImprovement} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>This day was fine</Text>
            </TouchableOpacity>

            <Text style={styles.stepTitle}>Where could've this day been better?</Text>
            <Text style={styles.stepSubtitle}>
              Optional — things can change. What would you do differently?
            </Text>

            <TextInput
              style={[styles.textInput, styles.textInputTall]}
              value={improvement}
              onChangeText={setImprovement}
              placeholder="Write it out..."
              placeholderTextColor="#5A5A72"
              multiline
              maxLength={400}
            />

            <TouchableOpacity
              style={[styles.nextBtn, createEntry.isPending && styles.nextBtnDisabled]}
              onPress={handleSubmit}
              disabled={createEntry.isPending}
              activeOpacity={0.8}
            >
              {createEntry.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextBtnText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "done" && (
          <Animated.View style={[styles.stepContent, { transform: [{ scale: scaleAnim }] }]}>
            <View style={[styles.doneBadge, { backgroundColor: getStarColor(stars) }]}>
              <Text style={styles.doneBadgeText}>{stars}★</Text>
            </View>
            <Text style={styles.doneTitle}>Logged.</Text>
            <Text style={styles.doneBody}>
              Every day you track is a data point that proves your life is better than your worst memories of it.
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0C0C14",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wizardContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    flexGrow: 1,
  },
  doneContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
    flexGrow: 1,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#282840",
  },
  stepDotActive: {
    backgroundColor: "#5E72EB",
    width: 24,
  },
  stepDotDone: {
    backgroundColor: "#4CD964",
  },
  stepContent: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  starsContainer: {
    paddingVertical: 24,
  },
  nextBtn: {
    backgroundColor: "#5E72EB",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    marginTop: 8,
    minWidth: 200,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FF3B30",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  skipBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#1E1E2C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#4CD964",
    marginBottom: 8,
  },
  skipBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#4CD964",
  },
  inputGroup: {
    width: "100%",
    gap: 12,
  },
  textInput: {
    backgroundColor: "#1E1E2C",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#282840",
    minHeight: 54,
    width: "100%",
    textAlignVertical: "top",
  },
  textInputTall: {
    minHeight: 120,
  },
  // Done state
  doneBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  doneBadgeText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  doneTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  doneBody: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  // Already-done view
  scoreCard: {
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    width: "100%",
  },
  scoreBadge: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scoreBadgeText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputCard: {
    backgroundColor: "#151520",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    width: "100%",
  },
  inputCardTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputCardValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 22,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#282840",
  },
  doneMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#5A5A72",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
