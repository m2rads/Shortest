"use server";

import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import {
  users,
  User,
  NewUser,
  pullRequests,
  PullRequest,
  NewPullRequest,
  connectedRepositories,
  ConnectedRepository,
  NewConnectedRepository,
} from "./schema";
import { auth } from "@clerk/nextjs/server";
import { and, sql } from "drizzle-orm";

export async function updateUserSubscription(
  clerkId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(users)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId));
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] || null;
}

export async function updateUserGithubToken(
  clerkId: string,
  accessToken: string
) {
  await db
    .update(users)
    .set({ githubAccessToken: accessToken })
    .where(eq(users.clerkId, clerkId));
}

export async function createUser(clerkId: string): Promise<User> {
  const newUser: NewUser = {
    clerkId,
    role: "member",
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();
  return createdUser;
}

export async function getPullRequests(): Promise<PullRequest[]> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return db.select().from(pullRequests).where(eq(pullRequests.userId, user.id));
}

export async function saveConnectedRepo(userId: number, repo: NewConnectedRepository): Promise<ConnectedRepository> {
  const [createdRepo] = await db.insert(connectedRepositories).values({
    ...repo,
    userId,
  }).returning();
  return createdRepo;
}

export async function getConnectedRepos(userId: number): Promise<ConnectedRepository[]> {
  return db.select().from(connectedRepositories).where(eq(connectedRepositories.userId, userId));
}

export async function isRepoConnected(userId: number, repoId: number): Promise<boolean> {
  const result = await db
    .select({ id: connectedRepositories.id })
    .from(connectedRepositories)
    .where(and(eq(connectedRepositories.userId, userId), eq(connectedRepositories.repoId, repoId)))
    .limit(1);
  return result.length > 0;
}
