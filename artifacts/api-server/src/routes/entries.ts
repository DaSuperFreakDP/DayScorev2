import { Router, type IRouter } from "express";
import { db, entriesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const router: IRouter = Router();

router.get("/entries/today", requireAuth, async (req, res): Promise<void> => {
  const today = getTodayDate();
  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.userId, req.user!.userId), eq(entriesTable.entryDate, today)));
  if (!entry) {
    res.status(404).json({ error: "No entry for today" });
    return;
  }
  res.json(entry);
});

router.get("/entries", requireAuth, async (req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.userId, req.user!.userId))
    .orderBy(entriesTable.entryDate);
  res.json(entries);
});

router.post("/entries", requireAuth, async (req, res): Promise<void> => {
  const { stars, goodInput1, goodInput2, improvementInput, skippedImprovement } = req.body as {
    stars?: number;
    goodInput1?: string;
    goodInput2?: string;
    improvementInput?: string | null;
    skippedImprovement?: boolean;
  };

  if (!stars || stars < 1 || stars > 5) {
    res.status(400).json({ error: "Stars must be between 1 and 5" });
    return;
  }
  if (!goodInput1 || !goodInput2) {
    res.status(400).json({ error: "Both positive inputs are required" });
    return;
  }

  const bannedWords = ["nothing", "none", "n/a", "na", "nil", "null", "nope", "no"];
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9/]/g, "");
  for (const label of ["goodInput1", "goodInput2"] as const) {
    const val = req.body[label]?.trim() ?? "";
    if (val.length < 3) {
      res.status(400).json({ error: `Each input must be at least 3 characters` });
      return;
    }
    if (bannedWords.some(bw => normalize(val) === normalize(bw))) {
      res.status(400).json({ error: `Please write something meaningful — "${val}" isn't specific enough` });
      return;
    }
  }

  const today = getTodayDate();
  const existing = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.userId, req.user!.userId), eq(entriesTable.entryDate, today)));
  if (existing.length > 0) {
    res.status(400).json({ error: "Entry already exists for today" });
    return;
  }

  const [entry] = await db
    .insert(entriesTable)
    .values({
      userId: req.user!.userId,
      entryDate: today,
      stars,
      goodInput1,
      goodInput2,
      improvementInput: improvementInput ?? null,
      skippedImprovement: skippedImprovement === true,
    })
    .returning();

  res.status(201).json(entry);
});

export default router;
