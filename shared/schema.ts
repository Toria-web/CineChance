import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlist type enum
export const listTypeEnum = pgEnum("list_type", ["watched", "want_to_watch"]);

// Watchlist items table
export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tmdbId: integer("tmdb_id").notNull(),
    mediaType: varchar("media_type", { length: 10 }).notNull(), // 'movie' or 'tv'
    listType: listTypeEnum("list_type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    posterPath: varchar("poster_path", { length: 500 }),
    releaseDate: varchar("release_date", { length: 20 }),
    voteAverage: real("vote_average"),
    overview: text("overview"),
    addedAt: timestamp("added_at").defaultNow(),
  },
  (table) => [
    index("idx_watchlist_user").on(table.userId),
    index("idx_watchlist_user_tmdb").on(table.userId, table.tmdbId, table.mediaType),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlistItems: many(watchlistItems),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  user: one(users, {
    fields: [watchlistItems.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type InsertWatchlistItem = typeof watchlistItems.$inferInsert;

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
  addedAt: true,
});

export type InsertWatchlistItemInput = z.infer<typeof insertWatchlistItemSchema>;

// TMDB API types (not stored in DB, used for API responses)
export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  media_type?: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}
