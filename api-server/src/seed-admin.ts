import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  const username = "admin";
  const password = "admin1";

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existing.length > 0) {
    console.log(`Admin user "${username}" already exists (id=${existing[0].id})`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash, isAdmin: true })
    .returning();

  console.log(`Admin user created: id=${user.id}, username="${user.username}"`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
