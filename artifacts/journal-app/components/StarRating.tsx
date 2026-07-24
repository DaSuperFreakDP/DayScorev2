import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { getStarColor } from "@/constants/colors";

interface StarRatingProps {
  value: number;
  onChange: (stars: number) => void;
  size?: number;
  readonly?: boolean;
}

const LABELS = ["Rough", "Okay", "Decent", "Good", "Great"];

export function StarRating({ value, onChange, size = 52, readonly = false }: StarRatingProps) {
  const scales = [1, 2, 3, 4, 5].map(() => React.useRef(new Animated.Value(1)).current);

  const handlePress = (star: number) => {
    if (readonly) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const anim = scales[star - 1];
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.35, duration: 100, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    onChange(star);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= value;
          const color = getStarColor(star);
          return (
            <TouchableOpacity
              key={star}
              activeOpacity={0.7}
              onPress={() => handlePress(star)}
              disabled={readonly}
            >
              <Animated.View
                style={[
                  styles.star,
                  { width: size, height: size, borderRadius: size / 2 },
                  isSelected
                    ? { backgroundColor: color }
                    : { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)" },
                  { transform: [{ scale: scales[star - 1] }] },
                ]}
              >
                <Text
                  style={[
                    styles.starIcon,
                    { fontSize: size * 0.48 },
                    isSelected ? { opacity: 1 } : { opacity: 0.35 },
                  ]}
                >
                  ★
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
      {value > 0 && (
        <Text style={[styles.label, { color: getStarColor(value) }]}>
          {LABELS[value - 1]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  star: {
    alignItems: "center",
    justifyContent: "center",
  },
  starIcon: {
    color: "#FFFFFF",
    fontWeight: "bold" as const,
    lineHeight: 56,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
