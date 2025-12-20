// src/lib/movieStatus.ts
/**
 * Временная функция для генерации случайных статусов медиа
 * В будущем будет заменена на проверку в базе данных
 */
export type MediaStatus = 'want' | 'watched' | 'dropped' | null;

// Хранилище для тестирования (в будущем заменится на запрос к БД)
const mediaStatuses = new Map<string, MediaStatus>();

// Генерируем уникальный ключ с учетом типа медиа
const getStatusKey = (id: number, mediaType: 'movie' | 'tv'): string => {
  return `${mediaType}_${id}`;
};

export const getMediaStatus = (id: number, mediaType: 'movie' | 'tv'): MediaStatus => {
  const key = getStatusKey(id, mediaType);
  
  // Для тестирования генерируем случайный статус на основе ID
  const statuses: (MediaStatus)[] = [null, 'want', 'watched', 'dropped'];
  const index = id % 4; // Используем остаток от деления на 4
  
  // Проверяем, есть ли уже сохраненный статус
  if (mediaStatuses.has(key)) {
    return mediaStatuses.get(key)!;
  }
  
  // Генерируем и сохраняем статус для этого медиа
  const status = statuses[index];
  mediaStatuses.set(key, status);
  return status;
};

export const setMediaStatus = (id: number, mediaType: 'movie' | 'tv', status: MediaStatus): void => {
  const key = getStatusKey(id, mediaType);
  mediaStatuses.set(key, status);
};