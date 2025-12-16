"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth form state
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const signInWithEmail = async () => {
    setErrorMessage(null);
    const res = await signIn('credentials', { redirect: false, email: authEmail, password: authPassword });
    if ((res as any)?.error) {
      setErrorMessage((res as any).error);
    } else {
      setShowAuthForm(false);
      router.refresh();
    }
  };

  const signUpWithEmail = async () => {
    setErrorMessage(null);
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (!r.ok) {
        let body: any = null;
        try {
          body = await r.json();
        } catch {
          body = await r.text();
        }
        const msg = (body && (body.message || body.error)) || `Sign-up failed (${r.status})`;
        setErrorMessage(msg);
        return;
      }
      await signInWithEmail();
    } catch (e: any) {
      setErrorMessage(String(e));
    }
  };

  const signOutClient = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const search = async () => {
    if (!query.trim()) return setMovies([]);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setMovies(Array.isArray(data) ? data : []);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Хедер */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Заголовок */}
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex-shrink-0">
            CineChance
          </h1>

          {/* Поиск на десктопе */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Поиск фильмов и сериалов..."
                className="w-full px-5 py-3 pr-12 bg-gray-900/80 border border-gray-700 rounded-xl text-base outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={search}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition"
                aria-label="Поиск"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Авторизация */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 hidden sm:inline">
                  Привет, {session.user.email?.split("@")[0]}
                </span>
                <button
                  onClick={signOutClient}
                  className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthForm(true)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition text-sm"
              >
                Вход
              </button>
            )}
          </div>
        </div>

        {/* Поиск на мобильном (под хедером) */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Поиск..."
              className="w-full px-5 py-3 pr-12 bg-gray-900/80 border border-gray-700 rounded-xl text-base outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={search}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800 transition"
              aria-label="Поиск"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Модальная форма авторизации */}
      {showAuthForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-md p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold mb-6 text-center">
              {authMode === 'login' ? 'Войти' : 'Регистрация'}
            </h3>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full px-4 py-3 mb-6 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errorMessage && (
              <p className="text-red-400 text-sm mb-4 text-center">{errorMessage}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={authMode === 'login' ? signInWithEmail : signUpWithEmail}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition"
              >
                {authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="flex-1 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                {authMode === 'login' ? 'Регистрация' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Карточки */}
      <main className="pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
          {movies.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              <div className="relative w-full aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
                {m.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                    alt={m.title || m.name}
                    fill
                    className="object-cover"
                    unoptimized
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    Нет постера
                  </div>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <p className="text-sm font-medium line-clamp-2">{m.title || m.name}</p>
                <p className="text-xs text-yellow-400 mt-1">★ {m.vote_average?.toFixed(1) || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}