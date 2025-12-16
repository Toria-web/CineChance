import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ru-RU&page=1&include_adult=false`
    );
    const data = await res.json();
    return NextResponse.json(data.results?.slice(0, 30) || []);
  } catch (error) {
    return NextResponse.json([]);
  }
}