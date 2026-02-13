import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, pattern } = body;
    
    const expectedSecret = process.env.CACHE_CLEAR_SECRET || 'dev-secret';
    if (secret !== expectedSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 });
    }

    const patterns = pattern 
      ? [pattern] 
      : [
          'user:*:stats',
          'user:*:achiev_collection*',
          'user:*:achiev_actors*',
          'user:*:tag_usage*',
          'user:*:genres*'
        ];

    let totalDeleted = 0;
    
    for (const p of patterns) {
      const keys = await redis.keys(p);
      if (keys.length > 0) {
        await redis.del(...keys);
        totalDeleted += keys.length;
        logger.info(`Cleared cache pattern "${p}": ${keys.length} keys`, { context: 'CacheClear' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedKeys: totalDeleted,
      patterns 
    });
  } catch (error) {
    logger.error('Cache clear error', { 
      error: error instanceof Error ? error.message : String(error),
      context: 'CacheClear'
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
