# Vercel Image Optimization: Проблема и Решение

**Date:** 2026-02-09  
**Issue:** 5000 transformations/month лимит Vercel сгораел за 1 день  
**Root Cause:** Image Optimization была включена по умолчанию  
**Status:** ✅ FIXED

---

## 🔴 Проблема

Vercel's free tier Image Optimization: **5000 transformations/month**  
На сайте с 20+ фильмами это сгорает зa **1-2 дня**:

- Каждый размер изображения = 1 transformation
- Мобильные + десктопные размеры = 2x трансформации
- WEBP + JPEG = 2x трансформации каждого размера
- Без явного лимита = неограниченные трансформации

**Пример:** 20 постеров × 4 размера × 2 формата = 160 трансформаций за загрузку страницы

---

## ✅ Решение

### 1. Отключили Image Optimization в `next.config.ts`

```typescript
images: {
  unoptimized: true,  // ← ГЛАВНОЕ!
}
```

**Результат:** Vercel 0 transformations (полностью отключено)

### 2. Добавили `unoptimized={true}` во все Image компоненты

| Файл | Изменение |
|------|-----------|
| `ImageWithFallback.tsx` | ✅ `unoptimized={true}` |
| `ImageWithProxy.tsx` | ✅ `unoptimized={true}` |
| `MoviePosterProxy.tsx` | ✅ `unoptimized={true}` |
| `Header.tsx` | ✅ `unoptimized={true}` |

### 3. Все внешние изображения идут через наш прокси

```typescript
// ✅ ПРАВИЛЬНО
<Image src={`/api/image-proxy?url=${encodedUrl}`} unoptimized={true} />

// ❌ НЕПРАВИЛЬНО (Vercel будет пытаться оптимизировать)
<Image src={`https://image.tmdb.org/t/p/w500${poster}`} />
```

---

## 🏗️ Архитектура загрузки изображений

```
Browser
   ↓
Next.js Image Component
   ├─ unoptimized={true} (skip Vercel)
   ↓
/api/image-proxy (наш прокси)
   ├─ Redis Cache Check (server-side)
   ├─ Rate Limit Check (300 req/min)
   ├─ TMDB / FANART_TV / Fallback / Placeholder
   ├─ Response Headers:
   │  ├─ Success: max-age=3600 (1 hour)
   │  └─ Error: no-cache, no-store
   ↓
Browser Cache (1 час)
```

**Результат:**
- Vercel: **0 transformations** ✅
- Server (Redis): Кеширует на 6 часов
- Browser: Кеширует на 1 час
- Total overhead: **минимальный**

---

## 📋 Изменённые файлы

1. **next.config.ts** - `unoptimized: true` с комментариями
2. **ImageWithFallback.tsx** - добавлен `unoptimized={true}`
3. **Header.tsx** - добавлен `unoptimized={true}` для логотипа
4. **docs/deployment/vercel-image-optimization.md** - полная документация
5. **scripts/check-image-optimization.sh** - скрипт проверки

---

## 🔍 Проверка

### До деплоя на production:

```bash
bash scripts/check-image-optimization.sh
```

Должно вывести:
```
✅ All Image Optimization checks passed!
```

### После деплоя:

1. Перейти на https://vercel.com/dashboard
2. CineChance → Analytics → Image Optimization
3. Должно быть: **0 transformations** (или очень близко)

---

## 📚 Документация

- [Полное руководство](./vercel-image-optimization.md)
- [Image Proxy API](../../src/app/api/image-proxy/route.ts)
- [FANART_TV Integration](../api/fanart-tv.md)

---

## 🚀 Результат

**Before:**
```
❌ 5000 transformations/month
❌ Лимит за 1 день
❌ Дорогой upgrade на paid plan
```

**After:**
```
✅ 0 transformations
✅ Без лимитов от Vercel
✅ Оптимизация на собственных серверах
```

---

## 💡 Lessons Learned

1. **`unoptimized: true` по умолчанию для external URLs** — Vercel Image Optimization создана для локальных изображений
2. **Собственный прокси лучше** — полный контроль, кристальный кеш, fallbacks
3. **Проверяйте Vercel pricing limits** — 5000/month это очень мало для production
4. **Документируйте configuration** — Image Optimization легко забыть, лучше явно указать в коде

---

**Status:** READY FOR PRODUCTION ✅
