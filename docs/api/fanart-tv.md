# FANART_TV Integration

**Date:** 2026-02-09
**Status:** ✅ ADDED
**Purpose:** Резервный источник постеров фильмов и сериалов

## Overview

FANART.tv — это бесплатный API для получения плакатов и изображений фильмов/сериалов. Используется как **fallback** когда постер недоступен в TMDB.

## API Details

- **Base URL:** `https://webservice.fanart.tv/v3/{endpoint}/{tmdbId}`
- **Endpoints:**
  - `/movies/{tmdbId}` — для фильмов
  - `/series/{tmdbId}` — для сериалов
- **Authentication:** Требует `api_key` в параметрах
- **Rate Limit:** Free tier — нет явного ограничения (но рекомендуется быть разумным)

## Setup

### 1. Get API Key

1. Перейти на https://fanart.tv/
2. Зарегистрироваться (free)
3. Получить API key в профиле

### 2. Add to Environment

```bash
# .env.local
FANART_API_KEY=your_api_key_here
```

## Response Format

```json
{
  "movieposter": [
    {
      "id": "123456",
      "url": "https://assets.fanart.tv/fanart/movies/123/movieposter/...",
      "lang": "de",
      "likes": "42"
    }
  ],
  "moviethumb": [
    {
      "id": "789",
      "url": "https://assets.fanart.tv/fanart/movies/123/moviethumb/...",
      "lang": "en",
      "likes": "15"
    }
  ],
  "tvposter": [],
  "tvthumb": []
}
```

## Priority Order

При загрузке постера приложение пробует в следующем порядке:

1. **TMDB** — основной источник (самый надежный, русские названия)
2. **Redis Cache** — кешированный результат с сервера
3. **FANART_TV** — резервный источник если TMDB не сработал
4. **Placeholder SVG** — если все источники отказали

```typescript
// Приоритет в image-proxy:
// TMDB URL → Cache Hit → Cache Miss → FANART_TV → Placeholder
```

## Implementation

### In `src/lib/tmdb.ts`

```typescript
export const getFanartTvPoster = async (
  tmdbId: number,
  mediaType: 'movie' | 'tv' = 'movie'
): Promise<string | null> => {
  // Опционально если нет FANART_API_KEY
  if (!FANART_API_KEY) return null;
  
  // Получает URL постера из FANART_TV
  // Возвращает null если API недоступен или постер не найден
};
```

### In `src/app/api/image-proxy/route.ts`

1. Получает `tmdbId` и `mediaType` из параметров URL
2. Если загрузка с основного URL не сработала
3. Вызывает `getFanartTvPoster(tmdbId, mediaType)`
4. Если вернул URL → загружает и кеширует
5. Если нет → пробует fallback URL или placeholder

## Features

✅ **Автоматическое резервное копирование**
- Если TMDB недоступен → пробуем FANART_TV
- Если FANART_TV недоступен → возвращаем placeholder

✅ **Кеширование**
- Redis кеширует результаты на 6 часов
- Уменьшает нагрузку на API

✅ **Graceful degradation**
- Если FANART_API_KEY не установлен → просто пропускаем (не ошибка)
- Все операции имеют 3-второй таймаут

✅ **Logging**
- Все операции логируются для отладки

## Testing

### Check if FANART_API_KEY is set

```bash
curl http://localhost:3000/api/image-proxy?url=...&tmdbId=550&mediaType=movie
# Должен показать в логах FANART_TV попытку если основной URL не работает
```

### Monitor in logs

```
[INFO] Using FANART_TV fallback { tmdbId: 550, mediaType: 'movie', ... }
```

## Limitations

- **Free API** — может быть медленнее TMDB
- **Quality** — постеры могут быть ниже качеством чем TMDB
- **No Language Support** — изображения не переводятся по языкам
- **Stability** — бесплатный сервис, может быть перерывы в работе (но редко)

## Future Improvements

- [ ] Кеширование на уровне CDN (CloudFlare)
- [ ] Fallback к Google Images if FANART_TV fails
- [ ] A/B тестирование качества TMDB vs FANART_TV
- [ ] Предварительная загрузка для популярных фильмов

## References

- [FANART_TV Official Site](https://fanart.tv/)
- [FANART_TV API Docs](https://fanart.tv/api/)
- [Issue: Image Proxy HTTP Caching](../bugs/2026-02-09-infinite-slow-loading-loop.md)
