'use client';

type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  return (
    <header className="h-16 bg-black/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between w-full">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-white text-2xl hover:text-purple-500 transition">
            {isSidebarOpen ? '◀' : '▶'}
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            CineChance
          </h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          <div className="relative hidden md:block flex-1 max-w-2xl mr-4">
            <input
              type="text"
              placeholder="Поиск фильмов и сериалов..."
              className="bg-gray-800/80 rounded-full py-2.5 px-5 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          {/* Кнопка входа удалена - она теперь в сайдбаре */}
        </div>
      </div>
    </header>
  );
}