import { Router, type IRouter } from "express";
import { db, usersTable, entriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.username);

  const summaries = await Promise.all(
    users.map(async (user) => {
      const entries = await db
        .select()
        .from(entriesTable)
        .where(eq(entriesTable.userId, user.id))
        .orderBy(desc(entriesTable.entryDate));

      const entryCount = entries.length;
      const lastEntryDate = entries[0]?.entryDate ?? null;
      const averageStars =
        entryCount > 0
          ? Math.round((entries.reduce((s, e) => s + e.stars, 0) / entryCount) * 10) / 10
          : null;

      return {
        id: user.id,
        username: user.username,
        entryCount,
        lastEntryDate,
        averageStars,
      };
    }),
  );

  res.json(summaries);
});

router.get(
  "/admin/users/:userId/entries",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const entries = await db
      .select({
        id: entriesTable.id,
        entryDate: entriesTable.entryDate,
        stars: entriesTable.stars,
        skippedImprovement: entriesTable.skippedImprovement,
      })
      .from(entriesTable)
      .where(eq(entriesTable.userId, userId))
      .orderBy(entriesTable.entryDate);

    res.json(entries);
  },
);

export default router;
