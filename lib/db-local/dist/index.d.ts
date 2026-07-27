import { Database } from "bun:sqlite";
import * as schema from "./schema";
export declare const db: import("drizzle-orm/bun-sqlite").BunSQLiteDatabase<typeof schema> & {
    $client: Database;
};
export * from "./schema";
//# sourceMappingURL=index.d.ts.map