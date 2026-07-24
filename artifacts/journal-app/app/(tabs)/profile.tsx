import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useGetStats } from "@workspace/api-client-react";
import { getStarColor } from "@/constants/colors";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: stats } = useGetStats();

  const topPadding = Platform.OS === "web" ? 67 + 24 : insets.top + 24;

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  const avgColor = stats && stats.totalEntries > 0
    ? getStarColor(Math.round(stats.averageStars))
    : "#9494A8";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 24 : insets.bottom + 24 },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarArea}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        {user?.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      {/* Quick stats */}
      {stats && stats.totalEntries > 0 && (
        <View style={styles.quickStats}>
          <View style={styles.qStat}>
            <Text style={styles.qStatValue}>{stats.totalEntries}</Text>
            <Text style={styles.qStatLabel}>Days logged</Text>
          </View>
          <View style={styles.qStatDivider} />
          <View style={styles.qStat}>
            <Text style={[styles.qStatValue, { color: avgColor }]}>
              {stats.averageStars.toFixed(1)}★
            </Text>
            <Text style={styles.qStatLabel}>Avg score</Text>
          </View>
          <View style={styles.qStatDivider} />
          <View style={styles.qStat}>
            <Text style={styles.qStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.qStatLabel}>Day streak</Text>
          </View>
        </View>
      )}

      {/* Admin panel button */}
      {user?.isAdmin && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/admin")}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: "#2A1F3D" }]}>
              <Feather name="users" size={18} color="#9B59B6" />
            </View>
            <Text style={styles.menuItemText}>Admin Panel</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#5A5A72" />
        </TouchableOpacity>
      )}

      {/* Sign out */}
      <TouchableOpacity
        style={[styles.menuItem, { marginTop: 8 }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: "#2A1A1A" }]}>
            <Feather name="log-out" size={18} color="#FF3B30" />
          </View>
          <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>Sign out</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.versionText}>DayScore — Track your life</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0C0C14",
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
    flexGrow: 1,
  },
  avatarArea: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5E72EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  adminBadge: {
    backgroundColor: "#2A1F3D",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#9B59B6",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  qStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  qStatValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  qStatLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  qStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#282840",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#151520",
    borderRadius: 16,
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
  },
  versionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#3A3A50",
    textAlign: "center",
    marginTop: 16,
  },
});
