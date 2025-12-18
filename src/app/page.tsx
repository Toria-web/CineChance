import MovieGrid from './components/MovieGrid';

export default function Home() {
  return (
    <div className="w-full max-w-full">
      {/* Теперь MovieGrid сам содержит заголовок и логику загрузки */}
      <MovieGrid />
      
      {/* Добавим отступ снизу */}
      <div className="h-8 sm:h-12"></div>
    </div>
  );
}