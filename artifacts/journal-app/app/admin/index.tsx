import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListUsers } from "@workspace/api-client-react";
import { getStarColor } from "@/constants/colors";
import type { AdminUserSummary } from "@workspace/api-client-react";

export default function AdminIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: users, isLoading } = useListUsers();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#5E72EB" size="large" />
      </View>
    );
  }

  const renderUser = ({ item }: { item: AdminUserSummary }) => {
    const avgColor = item.averageStars != null ? getStarColor(Math.round(item.averageStars)) : "#9494A8";
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => router.push(`/admin/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.userAvatar, { backgroundColor: avgColor + "30" }]}>
          <Text style={[styles.userAvatarLetter, { color: avgColor }]}>
            {item.username[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.userMeta}>
            {item.entryCount} {item.entryCount === 1 ? "entry" : "entries"}
            {item.lastEntryDate ? ` · Last: ${item.lastEntryDate}` : ""}
          </Text>
        </View>
        <View style={styles.userRight}>
          {item.averageStars != null && (
            <Text style={[styles.userAvg, { color: avgColor }]}>
              {item.averageStars.toFixed(1)}★
            </Text>
          )}
          <Feather name="chevron-right" size={18} color="#5A5A72" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={users ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderUser}
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 34 + 24 : insets.bottom + 24 },
      ]}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="users" size={40} color="#282840" />
          <Text style={styles.emptyText}>No users yet</Text>
        </View>
      }
    />
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
    backgroundColor: "#0C0C14",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
    flexGrow: 1,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151520",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarLetter: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  userMeta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  userRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userAvg: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#5A5A72",
  },
});
