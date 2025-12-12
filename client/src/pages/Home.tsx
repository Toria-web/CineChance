import { useState } from "react";
import { Check, Bookmark, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WatchlistGrid } from "@/components/WatchlistGrid";
import { TrendingGrid } from "@/components/TrendingGrid";
import { useQuery } from "@tanstack/react-query";
import type { WatchlistItem, User } from "@shared/schema";

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const [activeTab, setActiveTab] = useState("want_to_watch");

  const { data: wantToWatch } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist", "want_to_watch"],
  });

  const { data: watched } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist", "watched"],
  });

  const wantCount = wantToWatch?.length || 0;
  const watchedCount = watched?.length || 0;

  return (
    <div className="min-h-screen">
      {/* Welcome Header */}
      <section className="py-8 px-4 border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Welcome back, {user.firstName || "Movie Fan"}
          </h1>
          <p className="text-muted-foreground">
            You have {watchedCount} watched and {wantCount} in your watchlist
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start gap-2 bg-transparent p-0 h-auto flex-wrap">
              <TabsTrigger
                value="want_to_watch"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
                data-testid="tab-want-to-watch"
              >
                <Bookmark className="w-4 h-4" />
                Want to Watch
                <Badge variant="secondary" className="ml-1">
                  {wantCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
                data-testid="tab-watched"
              >
                <Check className="w-4 h-4" />
                Watched
                <Badge variant="secondary" className="ml-1">
                  {watchedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
                data-testid="tab-trending"
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="want_to_watch" className="mt-0">
              <WatchlistGrid listType="want_to_watch" />
            </TabsContent>

            <TabsContent value="watched" className="mt-0">
              <WatchlistGrid listType="watched" />
            </TabsContent>

            <TabsContent value="trending" className="mt-0">
              <TrendingGrid isAuthenticated={true} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
