import { prisma } from '@/lib/prisma';

/**
 * Простая функция для проверки работы с новым полем weightedRating
 * Возвращает существующую оценку или null
 */
export async function calculateWeightedRating(
  userId: string,
  tmdbId: number,
  mediaType: string
): Promise<{ weightedRating: number | null; debug: any }> {
  try {
    // Ищем запись в WatchList
    const record = await prisma.watchList.findUnique({
      where: {
        userId_tmdbId_mediaType: {
          userId,
          tmdbId,
          mediaType,
        },
      },
      select: {
        id: true,
        userRating: true,
        weightedRating: true,
        watchCount: true,
      },
    });

    if (!record) {
      return {
        weightedRating: null,
        debug: { error: 'Record not found' }
      };
    }

    // Простая логика: если есть weightedRating - используем его, иначе userRating
    const finalRating = record.weightedRating ?? record.userRating;

    return {
      weightedRating: finalRating,
      debug: {
        recordId: record.id,
        userRating: record.userRating,
        weightedRating: record.weightedRating,
        watchCount: record.watchCount,
        finalRating,
        usedFallback: record.weightedRating === null
      }
    };
  } catch (error) {
    console.error('Error calculating weighted rating:', error);
    return {
      weightedRating: null,
      debug: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}
