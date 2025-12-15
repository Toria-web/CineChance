import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  // Ensure TMDB API key is present on the server.
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({ message: 'TMDB_API_KEY is not configured on the server' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ru-RU`
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ message: `TMDB API error: ${res.status}`, details: text }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data.results?.slice(0, 20) || []);
  } catch (err: any) {
    return NextResponse.json({ message: 'Failed to fetch TMDB', details: String(err) }, { status: 502 });
  }
}