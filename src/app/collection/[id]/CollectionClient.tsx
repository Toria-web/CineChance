// src/app/collection/[id]/CollectionClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from '@/app/components/MovieCard';
import { MovieCardErrorBoundary } from '@/app/components/ErrorBoundary';
import Loader from '@/app/components/Loader';
import { BlacklistProvider } from '@/app/components/BlacklistContext';

interface CollectionMovie {
  id: number;
  media_type: 'movie';
  title: string;
  name: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  first_air_date: string;
  overview: string;
  status?: 'want' | 'watched' | 'dropped' | 'rewatched' | null;
  userRating?: number | null;
  isBlacklisted: boolean;
}

interface CollectionData {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: CollectionMovie[];
}

interface WatchlistStatus {
  tmdbId: number;
  mediaType: string;
  status: 'want' | 'watched' | 'dropped' | 'rewatched' | null;
  userRating: number | null;
}

export default function CollectionClient({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistStatuses, setWatchlistStatuses] = useState<Map<string, WatchlistStatus>>(new Map());

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch(`/api/collection/${collectionId}`);
        if (!res.ok) throw new Error('Failed to fetch collection');
        const data = await res.json();
        setCollection(data);
      } catch (err) {
        setError('Failed to load collection');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  // Batch-загрузка статусов из вишлиста для всех фильмов коллекции
  useEffect(() => {
    if (!collection) return;

    const fetchWatchlistStatuses = async () => {
      const movies = collection.parts.map(item => ({
        tmdbId: item.id,
        mediaType: item.media_type
      }));

      try {
        const res = await fetch('/api/movies/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movies }),
        });

        if (res.ok) {
          const data = await res.json();
          const statuses = new Map<string, WatchlistStatus>();
          
          collection.parts.forEach(item => {
            const key = `${item.media_type}_${item.id}`;
            const movieData = data[key];
            if (movieData) {
              statuses.set(key, {
                tmdbId: item.id,
                mediaType: item.media_type,
                status: movieData.status,
                userRating: movieData.userRating,
              });
            }
          });
          
          setWatchlistStatuses(statuses);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist statuses', err);
      }
    };

    fetchWatchlistStatuses();
  }, [collection]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader size="large" text="Загрузка..." />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error || 'Collection not found'}</div>
      </div>
    );
  }

  return (
    <BlacklistProvider>
      <div className="min-h-screen bg-gray-950 py-3 sm:py-4">
        <div className="container mx-auto px-2 sm:px-3">
          {/* Заголовок и информация */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Назад
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {collection.name}
            </h1>
            
            {collection.overview && (
              <p className="text-gray-400 text-sm max-w-3xl">
                {collection.overview}
              </p>
            )}
          </div>

          {/* Список фильмов */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Фильмы серии ({collection.parts.length})
            </h2>
            
            {collection.parts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {collection.parts.map((movie, index) => {
                  const statusKey = `${movie.media_type}_${movie.id}`;
                  const watchlistStatus = watchlistStatuses.get(statusKey);
                  
                  return (
                    <div key={movie.id} className="p-1">
                      <MovieCardErrorBoundary>
                        <MovieCard
                          movie={movie}
                          initialIsBlacklisted={movie.isBlacklisted}
                          initialStatus={watchlistStatus?.status}
                          initialUserRating={watchlistStatus?.userRating}
                          showRatingBadge
                          priority={index < 6}
                        />
                      </MovieCardErrorBoundary>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  В этой коллекции пока нет фильмов
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlacklistProvider>
  );
}
