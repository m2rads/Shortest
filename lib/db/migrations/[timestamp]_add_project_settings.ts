import { sql } from "drizzle-orm";
import { pgTable, serial, integer, json, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const projectSettings = pgTable(
  "project_settings",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    userId: integer("user_id").notNull(),
    environments: json("environments").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserProject: uniqueIndex("unique_user_project_idx").on(table.userId, table.projectId),
  })
);

export async function up(db) {
  await db.schema.createTable(projectSettings);
}

export async function down(db) {
  await db.schema.dropTable(projectSettings);
}