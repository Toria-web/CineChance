import { useState } from "react";
import { Star, Check, Bookmark, Plus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TMDBMovie, WatchlistItem } from "@shared/schema";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface MovieCardProps {
  movie: TMDBMovie | WatchlistItem;
  isInWatchlist?: WatchlistItem | null;
  onAddToWatched?: () => void;
  onAddToWantToWatch?: () => void;
  onRemove?: () => void;
  onMove?: (newList: "watched" | "want_to_watch") => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export function MovieCard({
  movie,
  isInWatchlist,
  onAddToWatched,
  onAddToWantToWatch,
  onRemove,
  onMove,
  isLoading = false,
  showActions = true,
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle both TMDB API response and DB stored item
  const isTMDBMovie = "id" in movie && !("tmdbId" in movie);
  const tmdbId = isTMDBMovie ? (movie as TMDBMovie).id : (movie as WatchlistItem).tmdbId;
  const title = isTMDBMovie
    ? (movie as TMDBMovie).title || (movie as TMDBMovie).name || "Unknown"
    : (movie as WatchlistItem).title;
  const posterPath = isTMDBMovie
    ? (movie as TMDBMovie).poster_path
    : (movie as WatchlistItem).posterPath;
  const releaseDate = isTMDBMovie
    ? (movie as TMDBMovie).release_date || (movie as TMDBMovie).first_air_date
    : (movie as WatchlistItem).releaseDate;
  const voteAverage = isTMDBMovie
    ? (movie as TMDBMovie).vote_average
    : (movie as WatchlistItem).voteAverage;
  const mediaType = isTMDBMovie
    ? (movie as TMDBMovie).media_type || "movie"
    : (movie as WatchlistItem).mediaType;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = voteAverage ? voteAverage.toFixed(1) : null;

  const posterUrl = posterPath
    ? `${TMDB_IMAGE_BASE}${posterPath}`
    : null;

  return (
    <div
      className="group relative aspect-[2/3] rounded-md overflow-visible bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-movie-${tmdbId}`}
    >
      {/* Poster Image */}
      <div className="relative w-full h-full rounded-md overflow-hidden">
        {posterUrl ? (
          <>
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={posterUrl}
              alt={`${title} poster`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? "scale-105" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm text-center px-2">
              No Poster
            </span>
          </div>
        )}

        {/* Rating Badge */}
        {rating && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 gap-1 bg-background/80 backdrop-blur-sm"
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating}</span>
          </Badge>
        )}

        {/* Media Type Badge */}
        <Badge
          variant="outline"
          className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur-sm"
        >
          {mediaType === "tv" ? "TV" : "Movie"}
        </Badge>

        {/* Watchlist Status Indicator */}
        {isInWatchlist && (
          <div className="absolute bottom-2 right-2">
            {isInWatchlist.listType === "watched" ? (
              <div className="w-6 h-6 rounded-full bg-green-500/90 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500/90 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>
        )}

        {/* Hover Overlay with Actions */}
        {showActions && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{ visibility: isHovered ? "visible" : "hidden" }}
          >
            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
              {title}
            </h3>
            {year && (
              <p className="text-white/70 text-xs mb-3">{year}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {isInWatchlist ? (
                <>
                  {isInWatchlist.listType === "want_to_watch" && onMove && (
                    <Button
                      size="sm"
                      className="w-full gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove("watched");
                      }}
                      disabled={isLoading}
                      data-testid={`button-move-watched-${tmdbId}`}
                    >
                      <Check className="w-3 h-3" />
                      Mark Watched
                    </Button>
                  )}
                  {isInWatchlist.listType === "watched" && onMove && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove("want_to_watch");
                      }}
                      disabled={isLoading}
                      data-testid={`button-move-want-${tmdbId}`}
                    >
                      <ArrowRight className="w-3 h-3" />
                      Move to Want
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full gap-1 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                      disabled={isLoading}
                      data-testid={`button-remove-${tmdbId}`}
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {onAddToWatched && (
                    <Button
                      size="sm"
                      className="w-full gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWatched();
                      }}
                      disabled={isLoading}
                      data-testid={`button-add-watched-${tmdbId}`}
                    >
                      <Check className="w-3 h-3" />
                      Watched
                    </Button>
                  )}
                  {onAddToWantToWatch && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWantToWatch();
                      }}
                      disabled={isLoading}
                      data-testid={`button-add-want-${tmdbId}`}
                    >
                      <Plus className="w-3 h-3" />
                      Want to Watch
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="aspect-[2/3] rounded-md overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
