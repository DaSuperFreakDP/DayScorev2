import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useGetStats, useListEntries } from "@workspace/api-client-react";
import { getStarColor } from "@/constants/colors";

function StatBlock({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { data: stats, isLoading } = useGetStats();
  const { data: entries } = useListEntries();

  const topPadding = Platform.OS === "web" ? 67 + 24 : insets.top + 24;

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: "#0C0C14" }]}>
        <ActivityIndicator color="#5E72EB" size="large" />
      </View>
    );
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <View style={[styles.screen, { paddingTop: topPadding }]}>
        <Text style={[styles.pageTitle, { paddingHorizontal: 24 }]}>Stats</Text>
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={40} color="#282840" />
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyBody}>Start logging your days and your stats will appear here.</Text>
        </View>
      </View>
    );
  }

  // Distribution of stars
  const distribution = [1, 2, 3, 4, 5].map((s) => ({
    stars: s,
    count: entries?.filter((e) => e.stars === s).length ?? 0,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 24 : insets.bottom + 24 },
      ]}
    >
      <Text style={styles.pageTitle}>Stats</Text>

      {/* Encouragement banner */}
      {stats.encouragementMessage && (
        <View style={styles.encouragementCard}>
          <Feather name="zap" size={18} color="#FFD60A" />
          <Text style={styles.encouragementText}>{stats.encouragementMessage}</Text>
        </View>
      )}

      {/* Streak cards */}
      <View style={styles.row}>
        <View style={[styles.bigCard, { flex: 1 }]}>
          <Feather name="activity" size={20} color="#5E72EB" />
          <Text style={styles.bigCardValue}>{stats.currentStreak}</Text>
          <Text style={styles.bigCardLabel}>Day streak</Text>
        </View>
        <View style={[styles.bigCard, { flex: 1 }]}>
          <Feather name="award" size={20} color="#FFD60A" />
          <Text style={styles.bigCardValue}>{stats.longestStreak}</Text>
          <Text style={styles.bigCardLabel}>Best streak</Text>
        </View>
      </View>

      {/* Average scores */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Averages</Text>
        <View style={styles.statsRow}>
          <StatBlock
            value={`${stats.averageStars.toFixed(1)}★`}
            label="All time"
            color={getStarColor(Math.round(stats.averageStars))}
          />
          <View style={styles.statDivider} />
          <StatBlock
            value={stats.weekAverage != null ? `${stats.weekAverage.toFixed(1)}★` : "—"}
            label="This week"
            color={stats.weekAverage != null ? getStarColor(Math.round(stats.weekAverage)) : undefined}
          />
          <View style={styles.statDivider} />
          <StatBlock
            value={stats.monthAverage != null ? `${stats.monthAverage.toFixed(1)}★` : "—"}
            label="This month"
            color={stats.monthAverage != null ? getStarColor(Math.round(stats.monthAverage)) : undefined}
          />
        </View>
      </View>

      {/* Star distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Score breakdown</Text>
        <View style={styles.distContainer}>
          {distribution.map(({ stars, count }) => (
            <View key={stars} style={styles.distRow}>
              <Text style={[styles.distStar, { color: getStarColor(stars) }]}>{stars}★</Text>
              <View style={styles.distBarBg}>
                <View
                  style={[
                    styles.distBar,
                    {
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: getStarColor(stars),
                    },
                  ]}
                />
              </View>
              <Text style={styles.distCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Total */}
      <View style={styles.totalCard}>
        <Text style={styles.totalValue}>{stats.totalEntries}</Text>
        <Text style={styles.totalLabel}>Days logged</Text>
      </View>
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
  content: {
    paddingHorizontal: 20,
    gap: 16,
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  encouragementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1E1C00",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFD60A30",
  },
  encouragementText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFD60A",
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  bigCard: {
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  bigCardValue: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 48,
  },
  bigCardLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
  },
  card: {
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#282840",
  },
  distContainer: {
    gap: 12,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  distStar: {
    width: 28,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  distBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#282840",
    borderRadius: 4,
    overflow: "hidden",
  },
  distBar: {
    height: "100%",
    borderRadius: 4,
  },
  distCount: {
    width: 28,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
    textAlign: "right",
  },
  totalCard: {
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  totalValue: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 56,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  emptyBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
    textAlign: "center",
    lineHeight: 22,
  },
});
