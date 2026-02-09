# Image Optimization & Vercel Rate Limit

**Date:** 2026-02-09
**Status:** ✅ FIXED
**Critical:** 🔴 Vercel имеет лимит 5000 transformations/month на free tier

## Problem

Vercel's Image Optimization часто сжигает месячный лимит всего за день, если не настроить правильно. **5000 requests/month = только ~166 requests/day**.

Почему это происходит:
- Каждый уникальный размер изображения = 1 transformation
- Каждый уникальный формат (jpeg, webp, avif) = 1 transformation
- Мобильные и десктопные размеры = разные трансформации
- Если не кешировать правильно = множественные запросы одного изображения

## Solution

### 1. Отключаем Image Optimization полностью в `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    // ⚠️ CRITICAL: Отключаем Image Optimization полностью
    // Все изображения загружаются как-есть без обработки на Vercel
    unoptimized: true,
  },
};
```

**Почему:**
- Мы используем `image-proxy` — наш собственный прокси для оптимизации
- Redis кеширует результаты
- Нет зависимости от лимита Vercel

### 2. Используем `image-proxy` для всех внешних изображений

```typescript
// ✅ ПРАВИЛЬНО: Используем наш прокси
const imageUrl = `/api/image-proxy?url=${encodeURIComponent(tmdbUrl)}&tmdbId=${movieId}&mediaType=movie`;

// ❌ НЕПРАВИЛЬНО: Прямо с TMDB (Vercel будет пытаться оптимизировать)
const imageUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
```

### 3. Добавляем `unoptimized={true}` для всех Image компонентов

```typescript
<Image
  src={imageUrl}
  alt="..."
  fill
  unoptimized={true}  // ← Важно!
/>
```

## Architecture

```
Browser
   ↓
Next.js Image Component (unoptimized=true)
   ↓
/api/image-proxy
   ├─ Check Redis Cache
   ├─ If hit → Return cached
   ├─ If miss → Fetch from TMDB/FANART_TV
   ├─ Cache on Redis (6 hours server-side)
   └─ Return to browser & Cache on browser (1 hour client-side)
```

**Результат:**
- Vercel: 0 transformations (всё отключено)
- Redis: Кеширует результаты на сервере
- Browser: Кеширует на клиенте на 1 час
- Total: Практически 0 нагрузки на Vercel

## Implementation Details

### next.config.ts

```typescript
images: {
  unoptimized: true,  // ← Главное!
  remotePatterns: [
    {
      protocol: "https",
      hostname: "image.tmdb.org",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "assets.fanart.tv",
      pathname: "/**",
    },
  ],
}
```

### All Image Components

| Component | Status | unoptimized |
|-----------|--------|------------|
| MoviePosterProxy | ✅ | true |
| ImageWithProxy | ✅ | true |
| ImageWithFallback | ✅ | true |
| Header (logo) | ✅ | true |

### image-proxy Flow

1. **Cache Check**: Redis (`image-proxy:base64(url)`)
2. **Rate Limit**: 300 req/min per IP
3. **Source Priority**:
   - TMDB (основной)
   - FANART_TV (fallback)
   - Fallback URL (если передан)
   - Placeholder SVG (если всё не сработало)
4. **Response Headers**:
   - Success: `Cache-Control: public, max-age=3600` (1 час для браузера)
   - Error: `Cache-Control: no-cache, no-store, must-revalidate` (не кешировать!!)
5. **Server Cache**: Redis 6 hours

## Monitoring

### Check Vercel Dashboard

Go to: https://vercel.com/dashboard → Projects → CineChance → Analytics → Image Optimization

Should see: **0 transformations** (or very close to 0)

### Debug Logs

```bash
# Check if image-proxy is being used
curl -H "x-cache: HIT/MISS" http://localhost:3000/api/image-proxy?url=...

# Should see:
# X-Cache: HIT (Redis cache)
# X-Cache: MISS (newly fetched and cached)
# X-Cache: MISS-FANART (FANART_TV fallback)
# X-Cache: PLACEHOLDER (error, showing placeholder)
```

## Common Mistakes

### ❌ Don't: Прямое использование TMDB/FANART_TV URLs

```typescript
// ПЛОХО: Vercel будет пытаться оптимизировать
return <Image src={`https://image.tmdb.org/t/p/w500${poster}`} />;
```

### ❌ Don't: Image Optimization с remotePatterns

```typescript
// ПЛОХО: Это включает Vercel Image Optimization для внешних источников
images: {
  remotePatterns: [{ hostname: "image.tmdb.org" }],
  // Без unoptimized: true!
}
```

### ❌ Don't: Множественные размеры одного изображения

```typescript
// ПЛОХО: Каждый размер = 1 transformation
<Image src={url} width={300} quality={90} />
<Image src={url} width={150} quality={75} />
```

### ✅ Do: Используем image-proxy + Redis + Browser Cache

```typescript
// ХОРОШО
<Image 
  src={`/api/image-proxy?${params}`}  // Наш прокси
  fill
  unoptimized={true}                  // Не оптимизируем
  priority={false}                     // Lazy load
  quality={75}                         // Фиксированное качество
/>
```

## Testing

### 1. Verify unoptimized is working

```bash
npm run build
# Should see: ✓ Optimized images
# Without transformations being recorded on Vercel
```

### 2. Load test

```bash
# Open DevTools → Network → Filter by Img
# Refresh page multiple times
# Should see Redis cache hits (fast, ~50-100ms)
```

### 3. Vercel Dashboard

After 1-2 weeks should see: **0 transformations** in analytics

## Future Optimizations

- [ ] **Webp conversion on image-proxy** (with sharp)
- [ ] **CDN caching** (CloudFlare)
- [ ] **Adaptive image sizes** (different sizes for mobile/desktop)
- [ ] **AVIF support** (better compression than webp)

## References

- [Next.js Image Component Docs](https://nextjs.org/docs/app/api-reference/components/image)
- [Vercel Image Optimization Pricing](https://vercel.com/docs/image-optimization)
- [Image Proxy Implementation](../../../src/app/api/image-proxy/route.ts)
- [moviePosterProxy.tsx](../../../src/app/components/MoviePosterProxy.tsx)
