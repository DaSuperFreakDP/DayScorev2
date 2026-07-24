import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListEntries } from "@workspace/api-client-react";
import { getStarColor } from "@/constants/colors";
import type { Entry } from "@workspace/api-client-react";

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

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { data: entries, isLoading } = useListEntries();

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const entryMap = React.useMemo(() => {
    const map: Record<string, Entry> = {};
    if (!entries) return map;
    for (const e of entries) {
      map[e.entryDate] = e;
    }
    return map;
  }, [entries]);

  const { firstDay, daysInMonth } = buildCalendar(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const topPadding = Platform.OS === "web" ? 67 + 24 : insets.top + 24;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: Platform.OS === "web" ? 34 + 24 : insets.bottom + 24 },
      ]}
    >
      <Text style={styles.pageTitle}>Calendar</Text>

      {/* Month nav */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.grid}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.dayHeader}>{d}</Text>
          </View>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }, (_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = dateKey(viewYear, viewMonth, day);
          const entry = entryMap[key];
          const isToday = key === todayKey;
          const bgColor = entry ? getStarColor(entry.stars) : "transparent";

          return (
            <View key={day} style={styles.dayCell}>
              <TouchableOpacity
                onPress={entry ? () => setSelectedEntry(entry) : undefined}
                activeOpacity={entry ? 0.6 : 1}
              >
                <View
                  style={[
                    styles.dayCircle,
                    entry && { backgroundColor: bgColor },
                    isToday && !entry && styles.dayCircleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      entry && styles.dayNumFilled,
                      isToday && !entry && styles.dayNumToday,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {isLoading && (
        <ActivityIndicator color="#5E72EB" style={{ marginTop: 24 }} />
      )}

      {/* Legend */}
      <View style={styles.legend}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getStarColor(s) }]} />
            <Text style={styles.legendLabel}>{s}★</Text>
          </View>
        ))}
      </View>

      {/* Monthly summary */}
      {entries && entries.length > 0 && (() => {
        const monthEntries = entries.filter(e => {
          const [ey, em] = e.entryDate.split("-").map(Number);
          return ey === viewYear && em - 1 === viewMonth;
        });
        if (monthEntries.length === 0) return null;
        const avg = monthEntries.reduce((s, e) => s + e.stars, 0) / monthEntries.length;
        return (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{MONTHS[viewMonth]}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{monthEntries.length}</Text>
                <Text style={styles.summaryLabel}>entries</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: getStarColor(Math.round(avg)) }]}>
                  {avg.toFixed(1)}★
                </Text>
                <Text style={styles.summaryLabel}>avg score</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Math.round((monthEntries.length / daysInMonth) * 100)}%
                </Text>
                <Text style={styles.summaryLabel}>tracked</Text>
              </View>
            </View>
          </View>
        );
      })()}

      {/* Entry detail modal */}
      <Modal
        visible={!!selectedEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEntry(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedEntry(null)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            {selectedEntry && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalDate}>
                    {new Date(selectedEntry.entryDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.modalScoreBadge, { backgroundColor: getStarColor(selectedEntry.stars) }]}>
                  <Text style={styles.modalScoreText}>{selectedEntry.stars}★</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>What was good</Text>
                  <Text style={styles.modalValue}>"{selectedEntry.goodInput1}"</Text>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalValue}>"{selectedEntry.goodInput2}"</Text>
                </View>

                {selectedEntry.improvementInput && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Room to grow</Text>
                    <Text style={styles.modalValue}>"{selectedEntry.improvementInput}"</Text>
                  </View>
                )}
                {selectedEntry.skippedImprovement && (
                  <View style={[styles.modalSection, { backgroundColor: "#1A2A1A" }]}>
                    <Text style={[styles.modalSectionTitle, { color: "#4CD964" }]}>This day was fine</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0C0C14",
  },
  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E2C",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#5A5A72",
    textTransform: "uppercase",
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: "#5E72EB",
  },
  dayNum: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  dayNumFilled: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  dayNumToday: {
    color: "#5E72EB",
    fontFamily: "Inter_600SemiBold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9494A8",
  },
  summaryCard: {
    backgroundColor: "#151520",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9494A8",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#282840",
  },
  // Entry detail modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#151520",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalDate: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  modalClose: {
    fontSize: 18,
    color: "#9494A8",
    padding: 4,
  },
  modalScoreBadge: {
    alignSelf: "center",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalScoreText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  modalSection: {
    backgroundColor: "#1E1E2C",
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9494A8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 22,
    fontStyle: "italic",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#282840",
  },
});
