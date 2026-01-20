import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minScore = parseInt(searchParams.get('minScore') || '60');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const opportunities = queries.getByScore.all(minScore, limit);
    const stats = queries.getStats.get();

    return NextResponse.json({
      opportunities,
      stats: stats || { total: 0, avg_score: 0, max_score: 0, unique_tickers: 0 },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
