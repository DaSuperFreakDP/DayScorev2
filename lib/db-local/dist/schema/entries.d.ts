import { z } from "zod/v4";
export declare const entriesTable: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
    name: "entries";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "id";
            tableName: "entries";
            dataType: "number";
            columnType: "SQLiteInteger";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "user_id";
            tableName: "entries";
            dataType: "number";
            columnType: "SQLiteInteger";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        entryDate: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "entry_date";
            tableName: "entries";
            dataType: "string";
            columnType: "SQLiteText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        stars: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "stars";
            tableName: "entries";
            dataType: "number";
            columnType: "SQLiteInteger";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        goodInput1: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "good_input_1";
            tableName: "entries";
            dataType: "string";
            columnType: "SQLiteText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        goodInput2: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "good_input_2";
            tableName: "entries";
            dataType: "string";
            columnType: "SQLiteText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        improvementInput: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "improvement_input";
            tableName: "entries";
            dataType: "string";
            columnType: "SQLiteText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        skippedImprovement: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "skipped_improvement";
            tableName: "entries";
            dataType: "boolean";
            columnType: "SQLiteBoolean";
            data: boolean;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: "created_at";
            tableName: "entries";
            dataType: "date";
            columnType: "SQLiteTimestamp";
            data: Date;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "sqlite";
}>;
export declare const insertEntrySchema: z.ZodObject<{
    userId: z.ZodInt;
    entryDate: z.ZodString;
    stars: z.ZodInt;
    goodInput1: z.ZodString;
    goodInput2: z.ZodString;
    improvementInput: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    skippedImprovement: z.ZodOptional<z.ZodBoolean>;
}, {
    out: {};
    in: {};
}>;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DbEntry = typeof entriesTable.$inferSelect;
//# sourceMappingURL=entries.d.ts.map