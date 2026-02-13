# Bug Fix: Пагинация дублирует фильмы

## Описание
При пагинации на странице "Мои фильмы" происходило дублирование уже загруженных фильмов в бесконечном цикле.

## Root Cause
В `api/my-movies/route.ts` была сломана логика пагинации:
```typescript
// БЫЛО (строка 262-263):
const recordsNeeded = Math.ceil(page * limit * 1.5) + 1;
const skip = 0; // Always from beginning for deterministic results
```

Проблемы:
1. `skip = 0` ВСЕГДА - означало что каждая страница загружала данные с начала
2. `take` увеличивался с каждой страницей (31, 61, 91...), но данные всегда брались с начала
3. JavaScript сортировка (`sortMovies`) отличалась от БД сортировки (`orderBy: addedAt, id`)
4. Это приводило к тому, что срез `sortedMovies.slice(pageStart, pageEnd)` возвращал те же данные

Также, согласно документации использовании `order Prisma, приBy` по полю с неуникальными значениями происходит неконсистентная сортировка.

**Источник:** [Prisma GitHub Issue #23615](https://github.com/prisma/prisma/issues/23615)

## Решение
1. Исправлена пагинация:
```typescript
// СТАЛО:
const skip = (page - 1) * limit;
const take = limit + 1; // +1 to detect hasMore
```

2. Добавлен `id` как вторичный критерий сортировки для стабильного порядка:
```typescript
orderBy: [{ addedAt: 'desc' }, { id: 'desc' }]
```

3. Добавлен secondary sort в JavaScript функции сортировки.

## Исправленные файлы

1. **`src/app/api/my-movies/route.ts`**
   - Исправлена логика пагинации (skip/take)
   - Blacklist query: добавлен `id` в orderBy
   - `sortMovies`: добавлен secondary sort по id

2. **`src/app/my-movies/actions.ts`**
   - WatchList query: добавлен `id` в orderBy
   - Blacklist query: добавлен `id` в orderBy
   - Исправлен `hasMore` calculation
   - `sortMoviesOnServer`: добавлен secondary sort по id

## Prevention
Все future запросы с пагинацией должны использовать правильный skip:
```typescript
const skip = (page - 1) * limit;
const take = limit + 1;
```
