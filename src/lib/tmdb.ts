export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('TMDB_API_KEY не найден в переменных окружения');
}

const fetchFromTMDB = async (endpoint: string, params?: Record<string, string>) => {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Для языка можно использовать 'ru-RU' или 'en-US'
    url.searchParams.append('language', 'ru-RU');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'accept': 'application/json',
      },
      next: { revalidate: 3600 } // Ревалидация каждый час для актуальности данных
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при запросе к TMDB:', error);
    throw error;
  }
};

// Получить популярные фильмы [citation:1]
export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  const data = await fetchFromTMDB('/movie/popular', { page: page.toString() });
  return data.results || [];
};

// Получить трендовые фильмы за день или неделю [citation:3]
export const fetchTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
  return data.results || [];
};

// Получить топ рейтинговых фильмов [citation:6]
export const fetchTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  const data = await fetchFromTMDB('/movie/top_rated', { page: page.toString() });
  return data.results || [];
};

// Поиск фильмов по названию
export const searchMovies = async (query: string, page: number = 1): Promise<Movie[]> => {
  const data = await fetchFromTMDB('/search/movie', { 
    query, 
    page: page.toString() 
  });
  return data.results || [];
};