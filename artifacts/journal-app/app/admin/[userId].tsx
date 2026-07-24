import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetAdminUserEntries } from "@workspace/api-client-react";
import { getStarColor } from "@/constants/colors";
import type { AdminEntry } from "@workspace/api-client-react";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export default function AdminUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const insets = useSafeAreaInsets();
  const parsedId = parseInt(userId ?? "0", 10);
  const { data: entries, isLoading } = useGetAdminUserEntries(parsedId, {
    query: { enabled: !!parsedId },
  });

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const entryMap = React.useMemo(() => {
    const map: Record<string, AdminEntry> = {};
    if (!entries) return map;
    for (const e of entries) {
      map[e.entryDate] = e;
    }
    return map;
  }, [entries]);

  const { firstDay, daysInMonth } = buildCalendar(viewYear, viewMonth);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const monthEntries = entries?.filter((e) => {
    const [ey, em] = e.entryDate.split("-").map(Number);
    return ey === viewYear && em - 1 === viewMonth;
  }) ?? [];

  const topPadding = Platform.OS === "web" ? 67 + 16 : 16;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#5E72EB" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 24 : insets.bottom + 24 },
      ]}
    >
      {/* Scores only notice */}
      <View style={styles.notice}>
        <Feather name="shield" size={14} color="#9494A8" />
        <Text style={styles.noticeText}>Score data only — no personal text is shown</Text>
      </View>

      {/* Month nav */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.grid}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.dayHeader}>{d}</Text>
          </View>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <View key={`e-${i}`} style={styles.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entry = entryMap[key];
          const isToday = key === todayKey;
          return (
            <View key={day} style={styles.dayCell}>
              <View
                style={[
                  styles.dayCircle,
                  entry && { backgroundColor: getStarColor(entry.stars) },
                  isToday && !entry && styles.dayCircleToday,
                ]}
              >
                <Text style={[styles.dayNum, entry && styles.dayNumFilled, isToday && !entry && styles.dayNumToday]}>
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Month summary */}
      {monthEntries.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{monthEntries.length}</Text>
              <Text style={styles.summaryLabel}>entries</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {
                color: getStarColor(Math.round(monthEntries.reduce((s, e) => s + e.stars, 0) / monthEntries.length))
              }]}>
                {(monthEntries.reduce((s, e) => s + e.stars, 0) / monthEntries.length).toFixed(1)}★
              </Text>
              <Text style={styles.summaryLabel}>avg</Text>
            </View>
          </View>
        </View>
      )}

      {/* All-time overall */}
      {entries && entries.length > 0 && (
        <View style={styles.overallCard}>
          <Text style={styles.overallTitle}>All time</Text>
          <Text style={[styles.overallAvg, {
            color: getStarColor(Math.round(entries.reduce((s, e) => s + e.stars, 0) / entries.length))
          }]}>
            {(entries.reduce((s, e) => s + e.stars, 0) / entries.length).toFixed(1)}★
          </Text>
          <Text style={styles.overallSub}>{entries.length} days logged</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0C0C14" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0C0C14" },
  content: { paddingHorizontal: 20, gap: 16, flexGrow: 1 },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1E1E2C",
    borderRadius: 10,
    padding: 12,
  },
  noticeText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#9494A8", flex: 1 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E1E2C", alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 },
  dayHeader: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#5A5A72" },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dayCircleToday: { borderWidth: 1.5, borderColor: "#5E72EB" },
  dayNum: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9494A8" },
  dayNumFilled: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" },
  dayNumToday: { color: "#5E72EB", fontFamily: "Inter_600SemiBold" },
  summaryCard: { backgroundColor: "#151520", borderRadius: 20, padding: 20 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9494A8" },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#282840" },
  overallCard: { backgroundColor: "#151520", borderRadius: 20, padding: 24, alignItems: "center", gap: 4 },
  overallTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#9494A8", textTransform: "uppercase", letterSpacing: 0.8 },
  overallAvg: { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 48 },
  overallSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9494A8" },
});
