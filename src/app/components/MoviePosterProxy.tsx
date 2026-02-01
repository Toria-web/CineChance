// src/app/components/MoviePosterProxy.tsx
'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { Media } from '@/lib/tmdb';
import { logger } from '@/lib/logger';

interface MoviePosterProxyProps {
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

const MoviePosterProxy = memo(({
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
}: MoviePosterProxyProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // При изменении movie сбрасываем все состояния загрузки
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setRetryCount(0);
  }, [movie.id, movie.poster_path]);

  const handlePosterError = () => {
    logger.warn('Poster load failed (proxy), trying next source', { 
      tmdbId: movie.id, 
      retryCount 
    });
    
    if (retryCount < 2) {
      // Пробуем следующую попытку
      setRetryCount(prev => prev + 1);
    } else {
      // Все попытки исчерпаны
      logger.warn('All poster attempts failed (proxy), showing placeholder', { tmdbId: movie.id });
      setImageError(true);
      onError?.();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    logger.info('Poster loaded successfully (proxy)', { tmdbId: movie.id, retryCount });
  };

  // Генерируем URL через наш прокси
  const getProxyUrl = () => {
    const tmdbUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
    
    if (!tmdbUrl) {
      return '/placeholder-poster.svg';
    }

    // Добавляем timestamp для cache busting при retry
    const timestamp = retryCount > 0 ? `&t=${Date.now()}` : '';
    
    return `/api/image-proxy?url=${encodeURIComponent(tmdbUrl)}${timestamp}`;
  };

  const imageUrl = imageError ? '/placeholder-poster.svg' : getProxyUrl();

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
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Используем Next.js Image с прокси URL */}
      <Image
        key={`${movie.id}-proxy-${retryCount}`}
        src={imageUrl}
        alt={movie.title || movie.name || 'Poster'}
        fill
        className={`object-cover transition-transform duration-500 ${
          isHovered && !showOverlay ? 'scale-105' : ''
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        loading={priority ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onError={handlePosterError}
        onLoad={handleImageLoad}
        unoptimized={true}
        quality={85}
      />
    </div>
  );
});

MoviePosterProxy.displayName = 'MoviePosterProxy';

export default MoviePosterProxy;
