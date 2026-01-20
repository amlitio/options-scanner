import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';
import { scanAllStocks, isMarketHours } from '@/lib/scanner';
import { sendDiscordAlert } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  if (!isMarketHours()) {
    return NextResponse.json({
      success: false,
      message: 'Market is closed',
    });
  }

  const scanStart = Date.now();

  try {
    console.log('🚀 Starting scan...');
    const opportunities = await scanAllStocks();

    let savedCount = 0;
    for (const opp of opportunities) {
      try {
        queries.insert.run(
          opp.ticker,
          opp.type,
          opp.strike,
          opp.expiration,
          opp.last_price,
          opp.volume,
          opp.open_interest,
          opp.implied_volatility || null,
          opp.underlying_price || null,
          opp.score,
          opp.reason || null
        );
        savedCount++;
      } catch (error) {
        // Skip duplicates
      }
    }

    const highQuality = opportunities.filter((o) => o.score >= 75);
    if (highQuality.length > 0) {
      await sendDiscordAlert(highQuality);
    }

    queries.cleanOld.run();

    const duration = ((Date.now() - scanStart) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      scan: {
        duration: `${duration}s`,
        opportunitiesFound: savedCount,
        highQuality: highQuality.length,
      },
    });
  } catch (error) {
    console.error('❌ Scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
