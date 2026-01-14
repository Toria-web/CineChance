// src/app/search/SearchClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import { Media } from '@/lib/tmdb';
import SearchFilters, { FilterState } from './SearchFilters';

interface SearchResults {
  results: Media[];
  totalPages: number;
  totalResults: number;
}

interface SearchClientProps {
  initialQuery: string;
  blacklistedIds: number[];
}

export default function SearchClient({ initialQuery, blacklistedIds }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Media[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [batchData, setBatchData] = useState<Record<string, any>>({});
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);

  const ITEMS_PER_PAGE = 20;
  const INITIAL_ITEMS = 30;

  const fetchBatchData = async (movies: Media[]) => {
    if (movies.length === 0) return;

    try {
      const response = await fetch('/api/movies/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies: movies.map(m => ({ tmdbId: m.id, mediaType: m.media_type })) }),
      });

      if (response.ok) {
        const data = await response.json();
        setBatchData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    }
  };

  // Handle filter changes
  const handleFiltersChange = async (filters: FilterState) => {
    if (!initialQuery) return;

    setLoading(true);
    try {
      // Determine type based on enabled filters
      let type = 'all';
      if (filters.showMovies && !filters.showTv && !filters.showAnime) {
        type = 'movie';
      } else if (!filters.showMovies && filters.showTv && !filters.showAnime) {
        type = 'tv';
      } else if (!filters.showMovies && !filters.showTv && filters.showAnime) {
        type = 'anime';
      } else if (!filters.showMovies && filters.showTv && filters.showAnime) {
        type = 'tv,anime';
      } else if (filters.showMovies && !filters.showTv && filters.showAnime) {
        type = 'movie,anime';
      } else if (filters.showMovies && filters.showTv && !filters.showAnime) {
        type = 'movie,tv';
      }

      const params = new URLSearchParams({
        q: initialQuery,
        page: '1',
        limit: String(INITIAL_ITEMS),
        type,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        quickYear: filters.quickYear,
        genres: filters.genres.join(','),
        ratingFrom: String(filters.ratingFrom),
        ratingTo: String(filters.ratingTo),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        listStatus: filters.listStatus,
      });

      const res = await fetch(`/api/search?${params.toString()}`);
      const data: SearchResults = await res.json();

      // Filter out blacklisted items and deduplicate
      const blacklistedSet = new Set(blacklistedIds);
      const seen = new Set<string>();
      const filteredResults = data.results.filter((item: Media) => {
        const key = `${item.media_type}_${item.id}`;
        if (seen.has(key) || blacklistedSet.has(item.id)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      setResults(filteredResults);
      setTotalResults(data.totalResults);
      setPage(1);
      setHasMore(filteredResults.length < data.totalResults);
      setCurrentFilters(filters);

      // Fetch batch data for the results
      fetchBatchData(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when query changes
  useEffect(() => {
    if (!initialQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}&page=1&limit=${INITIAL_ITEMS}`);
        const data: SearchResults = await res.json();

        // Filter out blacklisted items and deduplicate
        const blacklistedSet = new Set(blacklistedIds);
        const seen = new Set<string>();
        const filteredResults = data.results.filter((item: Media) => {
          const key = `${item.media_type}_${item.id}`;
          if (seen.has(key) || blacklistedSet.has(item.id)) {
            return false;
          }
          seen.add(key);
          return true;
        });

        setResults(filteredResults);
        setTotalResults(data.totalResults);
        setPage(1);
        setHasMore(filteredResults.length < data.totalResults);

        // Fetch batch data for the results
        fetchBatchData(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [initialQuery, blacklistedIds]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        q: initialQuery,
        page: String(nextPage),
        limit: String(ITEMS_PER_PAGE),
      });

      // Добавляем фильтры, если они есть
      if (currentFilters) {
        // Determine type based on enabled filters
        let type = 'all';
        if (currentFilters.showMovies && !currentFilters.showTv && !currentFilters.showAnime) {
          type = 'movie';
        } else if (!currentFilters.showMovies && currentFilters.showTv && !currentFilters.showAnime) {
          type = 'tv';
        } else if (!currentFilters.showMovies && !currentFilters.showTv && currentFilters.showAnime) {
          type = 'anime';
        } else if (!currentFilters.showMovies && currentFilters.showTv && currentFilters.showAnime) {
          type = 'tv,anime';
        } else if (currentFilters.showMovies && !currentFilters.showTv && currentFilters.showAnime) {
          type = 'movie,anime';
        } else if (currentFilters.showMovies && currentFilters.showTv && !currentFilters.showAnime) {
          type = 'movie,tv';
        }
        
        params.set('type', type);
        if (currentFilters.yearFrom) params.set('yearFrom', currentFilters.yearFrom);
        if (currentFilters.yearTo) params.set('yearTo', currentFilters.yearTo);
        if (currentFilters.quickYear) params.set('quickYear', currentFilters.quickYear);
        if (currentFilters.genres.length > 0) params.set('genres', currentFilters.genres.join(','));
        if (currentFilters.ratingFrom > 0) params.set('ratingFrom', String(currentFilters.ratingFrom));
        if (currentFilters.ratingTo < 10) params.set('ratingTo', String(currentFilters.ratingTo));
        params.set('sortBy', currentFilters.sortBy);
        params.set('sortOrder', currentFilters.sortOrder);
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data: SearchResults = await res.json();
      
      // Filter out blacklisted items and deduplicate
      const blacklistedSet = new Set(blacklistedIds);
      const seen = new Set<string>();
      const existingKeys = new Set(results.map(r => `${r.media_type}_${r.id}`));
      const newResults = data.results.filter((item: Media) => {
        const key = `${item.media_type}_${item.id}`;
        if (seen.has(key) || blacklistedSet.has(item.id) || existingKeys.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      setResults(prev => [...prev, ...newResults]);
      setPage(nextPage);
      setHasMore(results.length + newResults.length < data.totalResults);

      // Fetch batch data for new results
      fetchBatchData(newResults);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!initialQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">Введите запрос в поисковую строку сверху</p>
      </div>
    );
  }

  return (
    <>
          <SearchFilters onFiltersChange={handleFiltersChange} totalResults={totalResults} />

      {loading ? (
        <Loader text="Загрузка..." />
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {results.map((item, index) => {
              const key = `${item.id}-${item.media_type}`;
              const batch = batchData[key] || {};
              return (
                <div
                  key={`${item.media_type}_${item.id}`}
                  className="w-full min-w-0 p-1"
                >
                  <MovieCard 
                    movie={item} 
                    priority={index < 6}
                    initialStatus={batch.status}
                    initialIsBlacklisted={batch.isBlacklisted}
                    initialUserRating={batch.userRating}
                    initialWatchCount={batch.watchCount}
                    initialAverageRating={batch.averageRating}
                    initialRatingCount={batch.ratingCount}
                  />
                </div>
              );
            })}
          </div>

          {/* Кнопка "Ещё" */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                    Загрузка...
                  </>
                ) : (
                  'Ещё...'
                )}
              </button>
            </div>
          )}

          {/* Кнопка "Наверх" */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
              aria-label="Наверх"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm mb-2">Ничего не найдено</p>
          <p className="text-gray-500 text-xs">Попробуйте другой запрос</p>
        </div>
      )}
    </>
  );
}
