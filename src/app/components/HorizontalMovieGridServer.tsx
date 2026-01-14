// src/app/components/HorizontalMovieGridServer.tsx
import { fetchTrendingMovies } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import './ScrollContainer.css';
import ScrollContainer from './ScrollContainer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isUnder18 } from '@/lib/age-utils';
import { Media } from '@/lib/tmdb';

// Маппинг статусов
const STATUS_FROM_DB: Record<string, 'want' | 'watched' | 'dropped' | 'rewatched' | null> = {
  'Хочу посмотреть': 'want',
  'Просмотрено': 'watched',
  'Брошено': 'dropped',
  'Пересмотрено': 'rewatched',
};

// Интерфейс для входящих пропсов
interface Props {
  blacklistedIds?: Set<number>;
}

// Интерфейс для данных MovieCard
interface MovieCardData {
  movie: Media;
  isBlacklisted: boolean;
  status: 'want' | 'watched' | 'dropped' | 'rewatched' | null;
  userRating: number | null;
}

export default async function HorizontalMovieGridServer({ blacklistedIds = new Set() }: Props) {
  try {
    // Получаем сессию пользователя для проверки возраста
    const session = await getServerSession(authOptions);
    let shouldFilterAdult = false;
    const userId = session?.user?.id;

    // Проверяем возраст пользователя, если он авторизован
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId as string },
        select: { birthDate: true },
      });

      if (user?.birthDate) {
        shouldFilterAdult = isUnder18(user.birthDate);
      }
    }

    const movies = await fetchTrendingMovies('week');
    
    // Фильтруем: сначала черный список, потом взрослый контент
    let filteredMovies = movies.filter(movie => !blacklistedIds.has(movie.id));
    
    // Фильтруем взрослый контент для несовершеннолетних
    if (shouldFilterAdult) {
      filteredMovies = filteredMovies.filter(movie => !movie.adult);
    }
    
    const displayMovies = filteredMovies.slice(0, 20);

    // Если пользователь авторизован, получаем watchlist данные
    let watchlistMap: Map<string, { status: string | null; userRating: number | null }> = new Map();
    if (userId) {
      const watchlist = await prisma.watchList.findMany({
        where: { userId },
        include: { status: true }
      });
      
      watchlist.forEach((item) => {
        watchlistMap.set(`${item.mediaType}_${item.tmdbId}`, { 
          status: item.status?.name || null, 
          userRating: item.userRating 
        });
      });
    }

    // Подготавливаем данные для MovieCard
    const moviesWithData: MovieCardData[] = displayMovies.map((movie) => {
      const watchlistKey = `${movie.media_type}_${movie.id}`;
      const watchlistData = watchlistMap.get(watchlistKey);
      
      return {
        movie,
        isBlacklisted: blacklistedIds.has(movie.id),
        status: watchlistData ? (STATUS_FROM_DB[watchlistData.status || ''] || null) : null,
        userRating: watchlistData?.userRating || null,
      };
    });

    if (displayMovies.length === 0) {
      return (
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 mt-4">Популярное на этой неделе</h1>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6">
            <p className="text-yellow-300">Не удалось загрузить фильмы. Возможные причины:</p>
            <ul className="text-gray-400 text-sm mt-2 list-disc pl-5">
              <li>Проблемы с API ключом TMDB</li>
              <li>Ограничения API (лимит запросов)</li>
              <li>Временно недоступен сервер TMDB</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 mt-4">Популярное на этой неделе</h1>
        
        {/* Используем компонент ScrollContainer */}
        <ScrollContainer>
          {moviesWithData.map((data, index) => (
            <div key={data.movie.id} className="flex-shrink-0 w-48">
              <MovieCard 
                movie={data.movie} 
                priority={index < 4}
                initialIsBlacklisted={data.isBlacklisted}
                initialStatus={data.status}
                initialUserRating={data.userRating}
              />
            </div>
          ))}
        </ScrollContainer>
      </div>
    );
  } catch (error) {
    console.error('Ошибка в компоненте HorizontalMovieGridServer:', error);
    return (
      <div className="w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 mt-4">Популярное на этой неделе</h1>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
          <p className="text-red-300">Критическая ошибка при загрузке фильмов</p>
          <p className="text-gray-400 text-sm mt-2">Пожалуйста, проверьте консоль для подробностей.</p>
        </div>
      </div>
    );
  }
}
