import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MovieCard } from "./MovieCard";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TMDBSearchResponse, TMDBMovie, WatchlistItem } from "@shared/schema";

interface SearchBarProps {
  isAuthenticated: boolean;
}

export function SearchBar({ isAuthenticated }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery<TMDBSearchResponse>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [], page: 1, total_pages: 0, total_results: 0 };
      const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  // Add to watchlist mutation
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

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9 bg-muted/50 border-muted"
          data-testid="input-search"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
            data-testid="button-clear-search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-popover-border rounded-md shadow-lg max-h-[70vh] overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults?.results && searchResults.results.length > 0 ? (
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Found {searchResults.total_results} results
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {searchResults.results.slice(0, 10).map((movie) => (
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
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
