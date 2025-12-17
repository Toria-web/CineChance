'use client';

import Link from 'next/link';

type SidebarProps = {
  isOpen: boolean;
  toggle: () => void;
};

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  return (
    <>
      {/* Overlay только на мобильном, когда панель открыта */}
      {isOpen && (
        <div 
          onClick={toggle} 
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Кнопка закрытия на мобильном */}
        <div className="p-4 border-b border-gray-800 flex justify-end lg:hidden">
          <button onClick={toggle} className="text-white text-2xl hover:text-purple-500 transition">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-6 py-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/" 
                onClick={toggle}
                className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
              >
                Главная
              </Link>
            </li>
            <li>
              <Link href="/search" onClick={toggle} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
                Поиск
              </Link>
            </li>
            <li>
              <Link href="/lists" onClick={toggle} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
                Мои списки
              </Link>
            </li>
            <li>
              <Link href="/login" onClick={toggle} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
                Войти
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}