import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWatchlistItemSchema } from "@shared/schema";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(endpoint: string) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - allow unauthenticated access, return null if not logged in
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // TMDB Search - search movies and TV shows
  app.get("/api/search", async (req, res) => {
    try {
      const { query, page = "1" } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }
      const data = await tmdbFetch(
        `/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
      );
      // Filter to only movies and TV shows
      data.results = data.results.filter(
        (item: any) => item.media_type === "movie" || item.media_type === "tv"
      );
      res.json(data);
    } catch (error) {
      console.error("TMDB search error:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Get trending movies/shows
  app.get("/api/trending", async (req, res) => {
    try {
      const data = await tmdbFetch("/trending/all/week");
      data.results = data.results.filter(
        (item: any) => item.media_type === "movie" || item.media_type === "tv"
      );
      res.json(data);
    } catch (error) {
      console.error("TMDB trending error:", error);
      res.status(500).json({ message: "Failed to fetch trending" });
    }
  });

  // Get user's watchlist
  app.get("/api/watchlist/:listType", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listType } = req.params;
      if (listType !== "watched" && listType !== "want_to_watch") {
        return res.status(400).json({ message: "Invalid list type" });
      }
      const items = await storage.getWatchlistItems(userId, listType);
      res.json(items);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  // Check if item is in any watchlist
  app.get("/api/watchlist/check/:mediaType/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tmdbId, mediaType } = req.params;
      const item = await storage.getWatchlistItem(userId, parseInt(tmdbId), mediaType);
      res.json({ item: item || null });
    } catch (error) {
      console.error("Error checking watchlist:", error);
      res.status(500).json({ message: "Failed to check watchlist" });
    }
  });

  // Add to watchlist
  app.post("/api/watchlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertWatchlistItemSchema.safeParse({
        ...req.body,
        userId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const item = await storage.addToWatchlist(parsed.data);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  // Remove from watchlist
  app.delete("/api/watchlist/:mediaType/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tmdbId, mediaType } = req.params;
      await storage.removeFromWatchlist(userId, parseInt(tmdbId), mediaType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Move item between lists
  app.patch("/api/watchlist/:mediaType/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tmdbId, mediaType } = req.params;
      const { listType } = req.body;
      if (listType !== "watched" && listType !== "want_to_watch") {
        return res.status(400).json({ message: "Invalid list type" });
      }
      const item = await storage.moveToList(userId, parseInt(tmdbId), mediaType, listType);
      res.json(item);
    } catch (error) {
      console.error("Error moving item:", error);
      res.status(500).json({ message: "Failed to move item" });
    }
  });

  return httpServer;
}
