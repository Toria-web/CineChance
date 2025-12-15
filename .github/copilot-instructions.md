# Copilot / AI-инструкции для проекта CineChance

Коротко и по делу — что важно знать, чтобы быстро вносить изменения в этот репозиторий.

- **Архитектура:** монорепо с серверной частью на Express (Node + TypeScript) и клиентом на React/Vite. Сервер и клиент находятся в одном проекте и обслуживаются одним HTTP-сервером в `server/index.ts`.

- **Где смотреть стартовую точку:** главный серверный вход — `server/index.ts`. Роуты и API описаны в `server/routes.ts`. Клиентская точка входа — `client/src/main.tsx`, корневой компонент — `client/src/App.tsx`.

- **База данных:** используется Postgres + Drizzle ORM. Схемы таблиц описаны в `shared/schema.ts`. Подключение через `server/db.ts` использует `DATABASE_URL`.

- **Аутентификация:** интегрирована через Replit auth helper — см. `server/replitAuth.ts` и использование middleware в `server/routes.ts` (`setupAuth`, `isAuthenticated`). API-эндпоинты для входа/выхода — `/api/login`, `/api/logout`, `/api/auth/user`.

- **Внешние интеграции:** TMDB API используется для поиска/трендов; ключ — `TMDB_API_KEY`. Запросы идут из `server/routes.ts` через helper `tmdbFetch`.

- **Запуск и сборка:** ключевые npm-скрипты в `package.json`:
  - `dev` — локальная разработка: `NODE_ENV=development tsx server/index.ts` (поднимает сервер + Vite в dev режиме).
  - `build` — билд: `tsx script/build.ts`.
  - `start` — запуск продакшна: `NODE_ENV=production node dist/index.cjs`.
  - `db:push` — применить миграции/схему через `drizzle-kit`.

- **Порты и окружение:** сервер слушает `process.env.PORT` (по умолчанию 5000). Обязательно настроить `DATABASE_URL` и `TMDB_API_KEY` в окружении для интеграций.

- **Ключевые паттерны и конвенции в проекте:**
  - Сервер логирует только `/api` запросы (см. логика в `server/index.ts`) — не дублируйте логирование в других слоях без надобности.
  - API-роуты валидируются через `zod`/`drizzle-zod` (см. `shared/schema.ts` — `insertWatchlistItemSchema`). Используйте эти схемы для валидации входящих данных в новых эндпоинтах.
  - Клиент использует `@tanstack/react-query` для загрузки данных (см. `client/src/hooks/useAuth.ts`, `client/src/lib/queryClient.ts`). Добавляйте/используйте queryKeys консистентно (обычно строковые URL-ключи, например `['/api/auth/user']`).
  - Компоненты UI используют дизайн-систему в `client/src/components/ui/*` и утилиты (`cn` в `client/src/lib/utils.ts`). Поддерживайте эти примитивы для согласованного стиля.

- **Где менять поведение:**
  - API/логика хранения — `server/storage.ts` (реализация storage), `server/routes.ts` (контракты).
  - База/схема — `shared/schema.ts` (вносите изменения через `drizzle-kit` и `db:push`).
  - Клиентские фичи — `client/src/pages/*` и `client/src/components/*`.

- **Тестовый/отладочный флоу:**
  - Для локальной разработки запустите `pnpm install` (или `npm install`) и `pnpm dev` (или `npm run dev`).
  - Логи сервера видны в терминале, Vite overlay показывает ошибки клиентской сборки в браузере.

- **Частые мелкие подсказки для изменений:**
  - При добавлении API-эндпоинта: добавьте маршрут в `server/routes.ts`, используйте `isAuthenticated` для защищённых ресурсов и `insertWatchlistItemSchema`/`zod` для проверки тела запроса.
  - При изменении модели — обновите `shared/schema.ts` и выполните `npm run db:push` для применения изменений в базе.
  - Не меняйте порт — проект ожидает `PORT` из окружения (CI/hosting полагается на этом).

- **Файлы, которые следует открыть для быстрого контекста:**
  - `server/index.ts` — сервер, логика подключения Vite/статической сборки.
  - `server/routes.ts` — все API-эндпоинты и интеграции с TMDB/storage.
  - `shared/schema.ts` — таблицы Drizzle + Zod схемы.
  - `client/src/App.tsx` и `client/src/main.tsx` — клиентский роутинг и провайдеры (`react-query`, темы, тултипы).
  - `client/src/hooks/useAuth.ts` — как клиент получает текущего пользователя.

Если что-то неясно или нужно расширить раздел (например, объяснить `server/storage.ts` или CI/CD), скажите — я обновлю инструкцию. 
