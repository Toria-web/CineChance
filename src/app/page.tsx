export default function Home() {
  return (
    <div className="w-full max-w-full">
      {/* Увеличим верхний отступ и добавим боковые отступы */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 mt-4">Популярное сегодня</h1>
      
      {/* Сетка карточек с отступами */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((i) => (
          <div 
            key={i} 
            className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all w-full"
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-4">
              <span className="text-gray-400 text-sm sm:text-lg text-center">Фильм {i}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Добавим отступ снизу */}
      <div className="h-8 sm:h-12"></div>
    </div>
  );
}