import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Check, Bookmark, Film } from "lucide-react";
import type { WatchlistItem } from "@shared/schema";

interface WatchlistGridProps {
  listType: "watched" | "want_to_watch";
}

export function WatchlistGrid({ listType }: WatchlistGridProps) {
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist", listType],
  });

  const removeMutation = useMutation({
    mutationFn: async ({ tmdbId, mediaType }: { tmdbId: number; mediaType: string }) => {
      return apiRequest("DELETE", `/api/watchlist/${mediaType}/${tmdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed",
        description: "Item removed from your list",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({
      tmdbId,
      mediaType,
      newListType,
    }: {
      tmdbId: number;
      mediaType: string;
      newListType: "watched" | "want_to_watch";
    }) => {
      return apiRequest("PATCH", `/api/watchlist/${mediaType}/${tmdbId}`, {
        listType: newListType,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Moved",
        description: `Moved to ${variables.newListType === "watched" ? "Watched" : "Want to Watch"}`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {listType === "watched" ? (
            <Check className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-medium mb-2">
          {listType === "watched" ? "No watched movies yet" : "Your watchlist is empty"}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {listType === "watched"
            ? "Movies and shows you've watched will appear here. Use the search bar to find something you've seen!"
            : "Add movies and shows you want to watch using the search bar above."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MovieCard
          key={`${item.mediaType}-${item.tmdbId}`}
          movie={item}
          isInWatchlist={item}
          onRemove={() =>
            removeMutation.mutate({ tmdbId: item.tmdbId, mediaType: item.mediaType })
          }
          onMove={(newList) =>
            moveMutation.mutate({
              tmdbId: item.tmdbId,
              mediaType: item.mediaType,
              newListType: newList,
            })
          }
          isLoading={removeMutation.isPending || moveMutation.isPending}
        />
      ))}
    </div>
  );
}
