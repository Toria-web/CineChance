import {
  users,
  watchlistItems,
  type User,
  type UpsertUser,
  type WatchlistItem,
  type InsertWatchlistItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Watchlist operations
  getWatchlistItems(userId: string, listType: "watched" | "want_to_watch"): Promise<WatchlistItem[]>;
  getWatchlistItem(userId: string, tmdbId: number, mediaType: string): Promise<WatchlistItem | undefined>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, tmdbId: number, mediaType: string): Promise<void>;
  moveToList(userId: string, tmdbId: number, mediaType: string, newListType: "watched" | "want_to_watch"): Promise<WatchlistItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getWatchlistItems(userId: string, listType: "watched" | "want_to_watch"): Promise<WatchlistItem[]> {
    return await db
      .select()
      .from(watchlistItems)
      .where(and(eq(watchlistItems.userId, userId), eq(watchlistItems.listType, listType)))
      .orderBy(watchlistItems.addedAt);
  }

  async getWatchlistItem(userId: string, tmdbId: number, mediaType: string): Promise<WatchlistItem | undefined> {
    const [item] = await db
      .select()
      .from(watchlistItems)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.tmdbId, tmdbId),
          eq(watchlistItems.mediaType, mediaType)
        )
      );
    return item;
  }

  async addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem> {
    // First check if item already exists
    const existing = await this.getWatchlistItem(item.userId, item.tmdbId, item.mediaType);
    if (existing) {
      // Update list type if different
      if (existing.listType !== item.listType) {
        const [updated] = await db
          .update(watchlistItems)
          .set({ listType: item.listType, addedAt: new Date() })
          .where(eq(watchlistItems.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    const [newItem] = await db.insert(watchlistItems).values(item).returning();
    return newItem;
  }

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: string): Promise<void> {
    await db
      .delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.tmdbId, tmdbId),
          eq(watchlistItems.mediaType, mediaType)
        )
      );
  }

  async moveToList(
    userId: string,
    tmdbId: number,
    mediaType: string,
    newListType: "watched" | "want_to_watch"
  ): Promise<WatchlistItem | undefined> {
    const [updated] = await db
      .update(watchlistItems)
      .set({ listType: newListType, addedAt: new Date() })
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.tmdbId, tmdbId),
          eq(watchlistItems.mediaType, mediaType)
        )
      )
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
