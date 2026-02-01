# Радикальное решение проблемы постеров на мобильных устройствах

## Проблема

Предыдущие решения не помогли - постеры все равно не загружаются на мобильных Android Chrome. Проблема в Next.js Image компоненте и его нативном lazy loading.

## Радикальное решение

Создаем fallback компонент на основе обычного `<img>` элемента с полной кастомной логикой загрузки.

### 1. MoviePosterFallback компонент

**Ключевые отличия от MoviePoster:**

```typescript
// Используем обычный img вместо Next.js Image
<img
  id={`poster-${movie.id}`}
  src={imageUrl}
  onLoad={handleImageLoad}
  onError={handlePosterError}
  loading={priority ? "eager" : "lazy"}
/>
```

### 2. Улучшенная обработка состояний

```typescript
const [imageError, setImageError] = useState(false);
const [fanartPoster, setFanartPoster] = useState<string | null>(null);
const [isTryingFanart, setIsTryingFanart] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
const [retryCount, setRetryCount] = useState(0);
const [isLoading, setIsLoading] = useState(true);
```

### 3. Принудительная перезагрузка

```typescript
// Принудительно перезагружаем изображение
const img = document.getElementById(`poster-${movie.id}`) as HTMLImageElement;
if (img) {
  img.src = tmdbUrl;
}
```

### 4. Визуальная обратная связь

```typescript
{/* Loading indicator */}
{isLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
    <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
)}
```

### 5. Условный рендеринг в MovieCard

```typescript
{useFallbackPoster() ? (
  <MoviePosterFallback {...props} />
) : (
  <MoviePoster {...props} />
)}
```

### 6. Автоматическое переключение

```typescript
const useFallbackPoster = () => {
  // Всегда на мобильных + можно включить через environment
  return isMobileDevice() || process.env.NEXT_PUBLIC_USE_FALLBACK_POSTER === 'true';
};
```

## Преимущества подхода

### 1. Полный контроль над загрузкой
- Никаких Next.js оптимизаций которые могут мешать
- Прямой доступ к DOM элементу
- Принудительная перезагрузка при необходимости

### 2. Надежная обработка ошибок
- Кастомная retry логика
- Cache busting через timestamp
- Многоуровневый fallback

### 3. Визуальная обратная связь
- Loading spinner во время загрузки
- Плавные переходы
- Индикация состояния

### 4. Гибкость
- Можно включить для всех устройств через env переменную
- Автоматически на мобильных
- Легко откатить назад

## Environment переменная

```bash
# .env
NEXT_PUBLIC_USE_FALLBACK_POSTER=true
```

## Тестирование

1. **На мобильных**: Должен автоматически использоваться fallback
2. **На десктопе**: Можно включить через env переменную
3. **Сравнение**: Оба компонента должны работать одинаково

## Rollback план

Если fallback вызовет проблемы:
1. Установить `NEXT_PUBLIC_USE_FALLBACK_POSTER=false`
2. Или закомментировать автоматическое переключение на мобильных

```typescript
const useFallbackPoster = () => {
  // return isMobileDevice() || process.env.NEXT_PUBLIC_USE_FALLBACK_POSTER === 'true';
  return process.env.NEXT_PUBLIC_USE_FALLBACK_POSTER === 'true';
};
```

## Ожидаемый результат

- ✅ Постеры загружаются на мобильных Android Chrome
- ✅ Graceful degradation при ошибках
- ✅ Визуальная обратная связь для пользователя
- ✅ Сохранение функциональности на десктопе

Это решение должно окончательно решить проблему с загрузкой постеров на мобильных устройствах.
