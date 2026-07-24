import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin, useRegister } from "@workspace/api-client-react";
import type { AuthResponse } from "@workspace/api-client-react";

type Mode = "login" | "register";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin<Error>({
    mutation: {
      onSuccess: (data: AuthResponse) => {
        void login(data.token, data.user);
      },
      onError: (err: Error) => {
        setErrorMsg((err as unknown as { data?: { error?: string } })?.data?.error ?? "Login failed");
      },
    },
  });

  const registerMutation = useRegister<Error>({
    mutation: {
      onSuccess: (data: AuthResponse) => {
        void login(data.token, data.user);
      },
      onError: (err: Error) => {
        setErrorMsg((err as unknown as { data?: { error?: string } })?.data?.error ?? "Registration failed");
      },
    },
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const data = { data: { username: username.trim(), password } };
    if (mode === "login") {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 + 40 : insets.top + 40,
          paddingBottom: Platform.OS === "web" ? 34 + 40 : insets.bottom + 40,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoRing}>
          {[0, 1, 2, 3, 4].map((i) => {
            const colors = ["#FF3B30", "#FF6B35", "#FFD60A", "#7ED321", "#4CD964"];
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const r = 28;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors[i],
                  left: 36 + r * Math.cos(angle) - 8,
                  top: 36 + r * Math.sin(angle) - 8,
                }}
              />
            );
          })}
        </View>
        <Text style={styles.appName}>DayScore</Text>
        <Text style={styles.tagline}>Rate your day. Track your life.</Text>
      </View>

      {/* Mode switcher */}
      <View style={styles.modeTabs}>
        {(["login", "register"] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, mode === m && styles.modeTabActive]}
            onPress={() => {
              setMode(m);
              setErrorMsg(null);
            }}
          >
            <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
              {m === "login" ? "Sign In" : "Create Account"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#5A5A72"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#5A5A72"
            secureTextEntry
            onSubmitEditing={handleSubmit}
          />
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0C0C14",
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#151520",
    marginBottom: 20,
    position: "relative",
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
    marginTop: 6,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#1E1E2C",
    borderRadius: 14,
    padding: 4,
    marginBottom: 32,
    width: "100%",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#5E72EB",
  },
  modeTabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#1E1E2C",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#282840",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: "#5E72EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
