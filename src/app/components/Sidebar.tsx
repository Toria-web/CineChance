'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger кнопка — разместим в header позже */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 text-white text-3xl md:hidden"
        aria-label="Открыть меню"
      >
        ☰
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-white text-3xl"
            aria-label="Закрыть меню"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 md:mt-16">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="block py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                href="/search" // или куда у тебя поиск
                onClick={() => setIsOpen(false)}
                className="block py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
              >
                Поиск
              </Link>
            </li>
            <li>
              <Link
                href="/lists"
                onClick={() => setIsOpen(false)}
                className="block py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
              >
                Мои списки
              </Link>
            </li>
            {session ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
                  >
                    Профиль
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login" // или твоя модалка/страница входа
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-6 text-gray-400 hover:text-green-500 hover:bg-gray-800 transition"
                >
                  Войти
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}