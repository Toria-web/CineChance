import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TMDBSearchResponse, TMDBMovie } from "@shared/schema";

interface TrendingGridProps {
  isAuthenticated: boolean;
}

export function TrendingGrid({ isAuthenticated }: TrendingGridProps) {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<TMDBSearchResponse>({
    queryKey: ["/api/trending"],
  });

  const addToWatchlist = useMutation({
    mutationFn: async ({ movie, listType }: { movie: TMDBMovie; listType: "watched" | "want_to_watch" }) => {
      return apiRequest("POST", "/api/watchlist", {
        tmdbId: movie.id,
        mediaType: movie.media_type || "movie",
        listType,
        title: movie.title || movie.name || "Unknown",
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || movie.first_air_date,
        voteAverage: movie.vote_average,
        overview: movie.overview,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to watchlist",
        description: "Movie has been added to your list",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add movies",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
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

  if (!data?.results || data.results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No trending content available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {data.results.slice(0, 18).map((movie) => (
        <MovieCard
          key={`${movie.media_type}-${movie.id}`}
          movie={movie}
          showActions={isAuthenticated}
          onAddToWatched={() =>
            addToWatchlist.mutate({ movie, listType: "watched" })
          }
          onAddToWantToWatch={() =>
            addToWatchlist.mutate({ movie, listType: "want_to_watch" })
          }
          isLoading={addToWatchlist.isPending}
        />
      ))}
    </div>
  );
}
