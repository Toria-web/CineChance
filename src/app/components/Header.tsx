'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MenuIcon, CloseIcon, SearchIcon } from './Icons';

type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      if (window.innerWidth < 768) {
        setIsSearchExpanded(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsSearchExpanded(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const cancelSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth < 768 && 
          isSearchExpanded && 
          searchInputRef.current &&
          !searchInputRef.current.contains(e.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSearchExpanded]);

  return (
    <header className="h-16 bg-black/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between w-full relative">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        
        {/* Логотип и кнопка меню - скрываются при развернутом поиске на мобильных */}
        <div className={`flex items-center transition-all duration-300 ${
          isSearchExpanded ? 'md:flex hidden' : 'flex'
        }`}>
          <button 
            onClick={toggleSidebar} 
            className="text-white hover:text-purple-500 transition shrink-0 flex items-center justify-center w-8 h-8 mr-4"
            aria-label={isSidebarOpen ? "Скрыть меню" : "Показать меню"}
          >
            {/* Иконка гамбургера (три полоски) или крестика */}
            {!isSidebarOpen ? (
              <MenuIcon className="h-6 w-6" />
            ) : (
              <CloseIcon className="h-6 w-6" />
            )}
          </button>
          
          {/* Логотип */}
          <div className="relative w-8 h-8 mr-1">
            <Image
              src="/images/logo_lgt.png"
              alt="CineChance Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
            CineChance
          </h1>
        </div>

        {/* Поисковая строка */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          
          {/* Десктопная версия поиска (растягивается на всю ширину) */}
          <div className="relative hidden md:flex flex-1 ml-8 mr-4 max-w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Поиск фильмов и сериалов..."
              className="w-full px-5 py-3.5 pr-14 bg-gray-900/80 border border-gray-700 rounded-full text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-full hover:bg-gray-800/50 transition-all duration-200 group"
              aria-label="Поиск"
            >
              <SearchIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>

          {/* Мобильная версия: иконка лупы (сворачивается/разворачивается) */}
          <div className="md:hidden flex items-center">
            
            {/* Кнопка поиска (иконка) - всегда видна на мобильных */}
            {!isSearchExpanded && (
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                aria-label="Развернуть поиск"
              >
                <SearchIcon className="h-6 w-6" />
              </button>
            )}

            {/* Развернутое поле поиска на мобильных */}
            {isSearchExpanded && (
              <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center px-4">
                <div className="w-full flex items-center gap-3">
                  
                  {/* Поле ввода */}
                  <div className="flex-1 relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Поиск фильмов и сериалов..."
                      className="w-full px-5 py-3.5 pr-12 bg-gray-900/90 border border-gray-700 rounded-full text-white text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                      autoFocus
                    />
                    
                    {/* Кнопка поиска внутри поля */}
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-800/50 transition-all duration-200"
                      aria-label="Выполнить поиск"
                    >
                      <SearchIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                    </button>
                  </div>

                  {/* Кнопка закрытия (крестик) вместо "Отмена" */}
                  <button
                    onClick={cancelSearch}
                    className="p-3 rounded-full hover:bg-gray-800/50 transition-all duration-200 shrink-0"
                    aria-label="Закрыть поиск"
                  >
                    <CloseIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
