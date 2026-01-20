import axios from 'axios';
import { Opportunity } from './db';
import { calculateScore } from './scoring';

export const STOCK_UNIVERSE = [
  'PLTR', 'SOFI', 'LCID', 'RIVN', 'HOOD',
  'CHWY', 'BYND', 'GME', 'AMC',
  'PLUG', 'FCEL', 'ENPH', 'CLNE',
  'SAVA', 'OCGN', 'GEVO',
  'SPCE', 'RKLB', 'OPEN',
];

export interface ScanCriteria {
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  minScore: number;
  maxDaysToExpiration: number;
}

const DEFAULT_CRITERIA: ScanCriteria = {
  minPrice: parseFloat(process.env.MIN_PRICE || '1'),
  maxPrice: parseFloat(process.env.MAX_PRICE || '10'),
  minVolume: parseInt(process.env.MIN_VOLUME || '100'),
  minScore: parseInt(process.env.MIN_SCORE || '65'),
  maxDaysToExpiration: 60,
};

export async function scanStock(ticker: string, criteria: ScanCriteria = DEFAULT_CRITERIA): Promise<Opportunity[]> {
  try {
    const response = await axios.get(
      `https://query2.finance.yahoo.com/v7/finance/options/${ticker}`,
      {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }
    );

    const data = response.data;
    if (!data?.optionChain?.result?.[0]) return [];

    const result = data.optionChain.result[0];
    const underlyingPrice = result.quote.regularMarketPrice;
    const opportunities: Opportunity[] = [];

    for (const expiration of result.options.slice(0, 3)) {
      const expDate = new Date(expiration.expirationDate * 1000);
      const daysToExp = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysToExp < 7 || daysToExp > criteria.maxDaysToExpiration) continue;

      const expirationStr = expDate.toISOString().split('T')[0];

      for (const call of expiration.calls || []) {
        const opp = processOption(ticker, 'call', call, expirationStr, underlyingPrice, criteria);
        if (opp) opportunities.push(opp);
      }

      for (const put of expiration.puts || []) {
        const opp = processOption(ticker, 'put', put, expirationStr, underlyingPrice, criteria);
        if (opp) opportunities.push(opp);
      }
    }

    return opportunities.sort((a, b) => b.score - a.score).slice(0, 5);
  } catch (error) {
    console.error(`Error scanning ${ticker}:`, error);
    return [];
  }
}

function processOption(ticker: string, type: 'call' | 'put', option: any, expirationDate: string, underlyingPrice: number, criteria: ScanCriteria): Opportunity | null {
  const lastPrice = option.lastPrice || 0;
  const volume = option.volume || 0;

  if (lastPrice < criteria.minPrice || lastPrice > criteria.maxPrice || volume < criteria.minVolume) {
    return null;
  }

  const opportunity: Opportunity = {
    ticker,
    type,
    strike: option.strike,
    expiration: expirationDate,
    last_price: lastPrice,
    volume,
    open_interest: option.openInterest || 0,
    implied_volatility: option.impliedVolatility,
    underlying_price: underlyingPrice,
    score: 0,
  };

  const scoreResult = calculateScore(opportunity);
  opportunity.score = scoreResult.score;
  opportunity.reason = scoreResult.reason;

  return opportunity.score >= criteria.minScore ? opportunity : null;
}

export async function scanAllStocks(criteria: ScanCriteria = DEFAULT_CRITERIA): Promise<Opportunity[]> {
  const allOpportunities: Opportunity[] = [];
  console.log(`🔍 Scanning ${STOCK_UNIVERSE.length} stocks...`);

  for (const ticker of STOCK_UNIVERSE) {
    try {
      const opportunities = await scanStock(ticker, criteria);
      allOpportunities.push(...opportunities);
      await new Promise(r => setTimeout(r, 1500));
    } catch (error) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`✅ Found ${allOpportunities.length} opportunities`);
  return allOpportunities.sort((a, b) => b.score - a.score);
}

export function isMarketHours(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const time = hour * 60 + minute;

  if (day === 0 || day === 6) return false;
  return time >= 570 && time < 960; // 9:30 AM - 4:00 PM
}
