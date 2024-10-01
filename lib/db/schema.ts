import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeProductId: varchar("stripe_product_id", { length: 255 }),
    planName: varchar("plan_name", { length: 100 }),
    subscriptionStatus: varchar("subscription_status", { length: 20 }),
    name: varchar("name", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    githubAccessToken: varchar("github_access_token", { length: 255 }),
  },
  (users) => ({
    uniqueClerkId: uniqueIndex("unique_clerk_id").on(users.clerkId),
  })
);

export const pullRequests = pgTable(
  "pull_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    githubId: integer("github_id").notNull(),
    number: integer("number").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    state: varchar("state", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    owner: varchar("owner", { length: 255 }).notNull(),
    repo: varchar("repo", { length: 255 }).notNull(),
  },
  (table) => ({
    userGithubIdIdx: uniqueIndex("user_github_id_idx").on(
      table.userId,
      table.githubId
    ),
  })
);

export const connectedRepositories = pgTable(
  "connected_repositories",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    repoId: integer("repo_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    owner: varchar("owner", { length: 255 }).notNull(),
    defaultBranch: varchar("default_branch", { length: 255 }).notNull(),
    lastCommitDate: timestamp("last_commit_date"),
    lastCommitMessage: text("last_commit_message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserRepo: uniqueIndex("unique_user_repo_idx").on(table.userId, table.repoId),
  })
);

export const projectSettings = pgTable(
  "project_settings",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    userId: integer("user_id").notNull().references(() => users.id),
    environments: json("environments").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserProject: uniqueIndex("unique_user_project_idx").on(table.userId, table.projectId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PullRequest = typeof pullRequests.$inferSelect;
export type NewPullRequest = typeof pullRequests.$inferInsert;
export type ConnectedRepository = typeof connectedRepositories.$inferSelect;
export type NewConnectedRepository = typeof connectedRepositories.$inferInsert;
export type ProjectSettings = typeof projectSettings.$inferSelect;
export type NewProjectSettings = typeof projectSettings.$inferInsert;

export interface ExtendedPullRequest extends PullRequest {
  repository: {
    owner: string;
    repo: string;
  };
}

export const getExampleTable = async () => {
  const selectResult = await db.select().from(users);
  console.log("Results", selectResult);
};
