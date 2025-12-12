# KinoTracker

## Overview

KinoTracker is a movie and TV show tracking application that allows users to search for titles, maintain a personal watchlist, and track what they've already watched. The app integrates with TMDB (The Movie Database) API for movie/show data and uses Replit Auth for user authentication. It features a cinematic dark theme with poster-first visual browsing inspired by Netflix, IMDb, and Letterboxd.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (dark/light mode support)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx for development, esbuild for production)
- **API Design**: RESTful endpoints under `/api` prefix
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Tables**:
  - `users` - User profiles from Replit Auth
  - `sessions` - Session storage for authentication
  - `watchlistItems` - User watchlist entries with TMDB metadata

### Authentication
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Strategy**: Passport.js with OpenID Client
- **Session**: PostgreSQL-backed sessions with 1-week TTL
- **Protected Routes**: API endpoints use `isAuthenticated` middleware

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components including shadcn/ui
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and query client
│       └── pages/        # Page components
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── replitAuth.ts # Authentication setup
├── shared/           # Shared code between frontend/backend
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Drizzle database migrations
```

### Key Design Patterns
- **Storage Interface**: `IStorage` interface abstracts database operations for testability
- **Query Client Configuration**: Centralized fetch wrapper with automatic 401 handling
- **Theme System**: CSS custom properties with React context for runtime theme switching
- **Component Library**: shadcn/ui "new-york" style with custom color tokens

## External Dependencies

### Third-Party APIs
- **TMDB API**: Movie and TV show search, trending content, and metadata
  - Requires `TMDB_API_KEY` environment variable
  - Used for `/api/search` and `/api/trending` endpoints

### Database
- **PostgreSQL**: Primary data store
  - Requires `DATABASE_URL` environment variable
  - Drizzle Kit for schema migrations (`npm run db:push`)

### Authentication
- **Replit OIDC**: User authentication via Replit accounts
  - Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables
  - Endpoints: `/api/login`, `/api/logout`, `/api/auth/user`

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Data fetching and caching
- `openid-client`: OIDC authentication
- `passport` / `passport-local`: Authentication middleware
- Radix UI primitives: Accessible component foundations