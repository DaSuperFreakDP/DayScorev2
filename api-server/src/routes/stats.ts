import { Router, type IRouter } from "express";
import { db, entriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function subtractOneDay(dateStr: string): string {
  return subtractDays(dateStr, 1);
}

const router: IRouter = Router();

router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, req.user!.userId))
    .orderBy(entriesTable.entryDate);

  if (entries.length === 0) {
    res.json({
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      averageStars: 0,
      weekAverage: null,
      monthAverage: null,
      fiveStarWeekStreak: false,
      encouragementMessage: null,
    });
    return;
  }

  const dateSet = new Set(entries.map((e) => e.entryDate));
  const today = getTodayDate();

  // Current streak — counts from today or yesterday
  let currentStreak = 0;
  let checkDate = dateSet.has(today) ? today : subtractOneDay(today);
  while (dateSet.has(checkDate)) {
    currentStreak++;
    checkDate = subtractOneDay(checkDate);
  }

  // Longest streak
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 1;
  let runLen = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (subtractOneDay(sortedDates[i]) === sortedDates[i - 1]) {
      runLen++;
      if (runLen > longestStreak) longestStreak = runLen;
    } else {
      runLen = 1;
    }
  }
  if (sortedDates.length === 1) longestStreak = 1;

  const totalEntries = entries.length;
  const averageStars =
    entries.reduce((s, e) => s + e.stars, 0) / totalEntries;

  const sevenDaysAgo = subtractDays(today, 7);
  const thirtyDaysAgo = subtractDays(today, 30);

  const weekEntries = entries.filter((e) => e.entryDate >= sevenDaysAgo);
  const monthEntries = entries.filter((e) => e.entryDate >= thirtyDaysAgo);

  const weekAverage =
    weekEntries.length > 0
      ? weekEntries.reduce((s, e) => s + e.stars, 0) / weekEntries.length
      : null;
  const monthAverage =
    monthEntries.length > 0
      ? monthEntries.reduce((s, e) => s + e.stars, 0) / monthEntries.length
      : null;

  // 7-day all-5-star streak
  const fiveStarWeekStreak =
    weekEntries.length >= 7 && weekEntries.slice(-7).every((e) => e.stars === 5);

  // Encouragement message
  let encouragementMessage: string | null = null;
  if (fiveStarWeekStreak) {
    encouragementMessage = "5 stars a week straight. You're on a roll.";
  } else if (monthAverage !== null && monthAverage >= 4.0) {
    const pct = Math.round(monthAverage * 20);
    encouragementMessage = `${pct}% average this month. Life is good.`;
  } else if (currentStreak >= 30) {
    encouragementMessage = "30-day streak. Consistency is everything.";
  } else if (currentStreak >= 14) {
    encouragementMessage = "Two weeks straight. You're building something real.";
  } else if (currentStreak >= 7) {
    encouragementMessage = "One week without missing a day. Keep going.";
  } else if (totalEntries >= 30 && averageStars >= 3.5) {
    encouragementMessage = "Your life is better than you remember.";
  } else if (totalEntries >= 7 && averageStars >= 4.0) {
    encouragementMessage = "Most of your days are good. Let that sink in.";
  }

  res.json({
    currentStreak,
    longestStreak,
    totalEntries,
    averageStars: Math.round(averageStars * 10) / 10,
    weekAverage: weekAverage !== null ? Math.round(weekAverage * 10) / 10 : null,
    monthAverage: monthAverage !== null ? Math.round(monthAverage * 10) / 10 : null,
    fiveStarWeekStreak,
    encouragementMessage,
  });
});

export default router;
