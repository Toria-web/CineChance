import { NextResponse } from 'next/server';
import { rateLimit } from '@/middleware/rateLimit';

export async function GET(req: Request) {
  const { success } = await rateLimit(req, 'default');
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');
  const fallbackUrl = searchParams.get('fallback');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // Пробуем основной URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    // Определяем content type из ответа или по URL
    const contentType = response.headers.get('content-type') || 
      (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') ? 'image/jpeg' :
       imageUrl.includes('.png') ? 'image/png' :
       imageUrl.includes('.webp') ? 'image/webp' : 'image/jpeg');

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Если есть fallback URL, пробуем его
    if (fallbackUrl) {
      try {
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
        });

        if (fallbackResponse.ok) {
          const fallbackBuffer = await fallbackResponse.arrayBuffer();
          return new NextResponse(fallbackBuffer, {
            headers: {
              'Content-Type': fallbackResponse.headers.get('content-type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (fallbackError) {
        console.error('Fallback image error:', fallbackError);
      }
    }

    // Если все failed, возвращаем placeholder
    try {
      const placeholderResponse = await fetch(new URL('/placeholder-poster.svg', req.url));
      if (placeholderResponse.ok) {
        const placeholderBuffer = await placeholderResponse.arrayBuffer();
        return new NextResponse(placeholderBuffer, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (placeholderError) {
      console.error('Placeholder error:', placeholderError);
    }

    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
