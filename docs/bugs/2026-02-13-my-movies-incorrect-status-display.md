# 2026-02-13-my-movies-incorrect-status-display

## Описание проблемы

На странице "Мои фильмы" все фильмы отображались как "Просмотренные" независимо от их реального статуса:
- Все фильмы показывали иконку статуса "Просмотренно" (галочка)
- На вкладке "Хочу посмотреть" можно было поставить оценку, хотя это не предусмотрено
- Нельзя было отметить фильм как "Просмотренно" - кнопка не работала
- На вкладке "Скрытые" не отображался оверлей с эффектами
- Фильмы со статусом "Пересмотрено" отображались без соответствующей иконки

## Причина

В файле `src/app/my-movies/MyMoviesContentClient.tsx` передавался фиксированный `initialStatus: 'watched'` для всех фильмов вне зависимости от:
- Активной вкладки (watched, wantToWatch, dropped, hidden)
- Реального статуса фильма в базе данных

```typescript
// Было:
initialStatus={isRestoreView ? null : 'watched'}
```

Также компонент `FilmGridWithFilters` не передавал индивидуальный статус для каждого фильма - только общий `initialStatus` для всех.

## Решение

1. **Добавлен динамический расчет статуса вкладки** в `MyMoviesContentClient.tsx`:
```typescript
const getInitialStatus = () => {
  if (isRestoreView) return null;
  if (activeTab === 'watched') return 'watched';
  if (activeTab === 'wantToWatch') return 'want';
  if (activeTab === 'dropped') return 'dropped';
  return null;
};
```

2. **Расширен FilmGridWithFilters** новыми пропами:
- `getInitialStatus` - функция для получения статуса конкретного фильма
- `restoreView` - режим восстановления из черного списка
- `getInitialIsBlacklisted` - функция для получения статуса блокировки

3. **Обновлен маппинг статусов** в `MyMoviesContentClient.tsx`:
```typescript
getInitialStatus={(movie) => {
  const statusName = (movie as any).statusName;
  if (statusName === 'Пересмотрено') return 'rewatched';
  if (statusName === 'Просмотрено') return 'watched';
  if (statusName === 'Хочу посмотреть') return 'want';
  if (statusName === 'Брошено') return 'dropped';
  return initialStatus;
}}
```

4. **Добавлена поддержка restoreView** для корректного отображения скрытых фильмов.

## Файлы изменены

- `src/app/my-movies/MyMoviesContentClient.tsx` - добавлены getInitialStatus, restoreView, getInitialIsBlacklisted
- `src/app/components/FilmGridWithFilters.tsx` - добавлены новые пропсы для индивидуальных статусов

## Предотвращение

- Теперь каждый фильм получает свой реальный статус из базы данных через `statusName`
- Статус больше не хардкодится для всей страницы
- Добавлена поддержка всех типов статусов: want, watched, dropped, rewatched
