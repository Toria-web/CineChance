// src/app/components/MoviePosterFallback.tsx
'use client';

import { useState, useEffect, memo } from 'react';
import { Media } from '@/lib/tmdb';
import { logger } from '@/lib/logger';

interface MoviePosterFallbackProps {
  movie: Media;
  priority?: boolean;
  isBlacklisted?: boolean;
  restoreView?: boolean;
  isHovered?: boolean;
  showOverlay?: boolean;
  onError?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  children?: React.ReactNode;
}

const MoviePosterFallback = memo(({
  movie,
  priority = false,
  isBlacklisted = false,
  restoreView = false,
  isHovered = false,
  showOverlay = false,
  onError,
  onMouseEnter,
  onMouseLeave,
  onClick,
  children
}: MoviePosterFallbackProps) => {
  const [imageError, setImageError] = useState(false);
  const [fanartPoster, setFanartPoster] = useState<string | null>(null);
  const [isTryingFanart, setIsTryingFanart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // При изменении movie сбрасываем все состояния загрузки
  useEffect(() => {
    setImageError(false);
    setFanartPoster(null);
    setIsTryingFanart(false);
    setImageLoaded(false);
    setRetryCount(0);
    setIsLoading(true);
  }, [movie.id, movie.poster_path]);

  const handlePosterError = async () => {
    logger.warn('Poster load failed (fallback), trying fanart.tv', { 
      tmdbId: movie.id, 
      mediaType: movie.media_type,
      hasPosterPath: !!movie.poster_path,
      retryCount
    });
    
    // Пробуем Fanart.tv только если еще не пробовали и есть poster_path
    if (!isTryingFanart && !fanartPoster && movie.poster_path) {
      setIsTryingFanart(true);
      try {
        const res = await fetch(`/api/fanart-poster?tmdbId=${movie.id}&mediaType=${movie.media_type}`);
        if (res.ok) {
          const data = await res.json();
          if (data.poster) {
            logger.info('Fanart.tv poster found (fallback)', { tmdbId: movie.id });
            setFanartPoster(data.poster);
            setImageError(false);
            setImageLoaded(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        logger.error('Failed to fetch Fanart.tv poster (fallback)', { tmdbId: movie.id, error });
      }
    }
    
    // Если это первая ошибка и еще не было ретраев, пробуем перезагрузить TMDB изображение
    if (retryCount === 0 && !fanartPoster && movie.poster_path) {
      setRetryCount(1);
      const timestamp = Date.now();
      const tmdbUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}?t=${timestamp}`;
      logger.info('Retrying TMDB poster with cache bust (fallback)', { tmdbId: movie.id });
      
      // Принудительно перезагружаем изображение
      const img = document.getElementById(`poster-${movie.id}`) as HTMLImageElement;
      if (img) {
        img.src = tmdbUrl;
      }
      return;
    }
    
    logger.warn('All poster sources failed (fallback), showing placeholder', { tmdbId: movie.id });
    setImageError(true);
    setImageLoaded(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    logger.info('Poster loaded successfully (fallback)', { tmdbId: movie.id });
  };

  const imageUrl = imageError
    ? '/placeholder-poster.svg'
    : fanartPoster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}${retryCount > 0 ? `?t=${Date.now()}` : ''}` : '/placeholder-poster.svg');

  return (
    <div
      className={`relative w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-none overflow-hidden shadow-lg transition-all duration-300 ${
        restoreView || isBlacklisted
          ? 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
          : isHovered && !showOverlay ? 'shadow-xl' : ''
      } ${showOverlay ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Используем обычный img вместо Next.js Image */}
      <img
        id={`poster-${movie.id}`}
        src={imageUrl}
        alt={movie.title || movie.name || 'Poster'}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
          isHovered && !showOverlay ? 'scale-105' : ''
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoad}
        onError={handlePosterError}
        loading={priority ? "eager" : "lazy"}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Overlay для лучшего UX */}
      {!imageLoaded && !isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Загрузка...</span>
        </div>
      )}
    </div>
  );
});

MoviePosterFallback.displayName = 'MoviePosterFallback';

export default MoviePosterFallback;
