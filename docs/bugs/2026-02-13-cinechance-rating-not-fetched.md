# 2026-02-13-cinechance-rating-not-fetched

## Описание проблемы

В модальном окне "Подробнее" (RatingInfoModal) CineChance рейтинг отображался некорректно - показывался TMDB рейтинг вместо средней оценки всех пользователей сайта.

## Причина

В файле `src/app/components/MovieCard.tsx` условие для загрузки CineChance рейтинга при открытии модального окна никогда не выполнялось:

```tsx
// Загрузка CineChance рейтинга (если не передан)
if (cineChanceRating === null && movie.id && movie.media_type) {
```

Поскольку `cineChanceRating` инициализируется как `initialAverageRating` (TMDB рейтинг), условие `cineChanceRating === null` **никогда не выполнялось**. Поэтому API `/api/cine-chance-rating` для получения средней оценки всех пользователей **не вызывался**.

## Решение

Добавлен отдельный useEffect для загрузки CineChance рейтинга при монтировании компонента:

```tsx
// Загрузка CineChance рейтинга при монтировании компонента
useEffect(() => {
  if (!movie.id || !movie.media_type) return;

  const fetchCineChanceRating = async () => {
    try {
      const res = await fetch(`/api/cine-chance-rating?tmdbId=${movie.id}&mediaType=${movie.media_type}`);
      if (res.ok) {
        const data = await res.json();
        if (data.averageRating !== undefined) {
          setCineChanceRating(data.averageRating);
        }
        if (data.count !== undefined) {
          setCineChanceVoteCount(data.count);
        }
      }
    } catch (error) {
      // error handling
    }
  };

  fetchCineChanceRating();
}, [movie.id, movie.media_type]);
```

Теперь CineChance рейтинг загружается при монтировании компонента, а не при открытии модального окна.

## Файлы изменены

- `src/app/components/MovieCard.tsx` - добавлена загрузка CineChance рейтинга при монтировании

## Предотвращение

- Всегда загружать данные при монтировании, а не полагаться на условные проверки
- Проверять что API вызовы выполняются, а не просто проверять условия
