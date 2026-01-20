import { Opportunity } from './db';

export interface ScoringResult {
  score: number;
  reason: string;
}

export function calculateScore(opportunity: Opportunity): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  const priceScore = (10 - opportunity.last_price) * 1.5;
  score += Math.max(0, priceScore);
  if (opportunity.last_price <= 3) reasons.push('Very affordable');

  const volumeScore = Math.min(opportunity.volume / 500, 10);
  const oiScore = Math.min(opportunity.open_interest / 500, 10);
  score += volumeScore + oiScore;
  if (opportunity.volume > 5000) reasons.push('High volume');

  if (opportunity.implied_volatility) {
    const ivScore = Math.min(opportunity.implied_volatility * 100, 20);
    score += ivScore;
    if (opportunity.implied_volatility > 0.8) reasons.push('High IV');
  }

  if (opportunity.underlying_price) {
    const leverage = opportunity.underlying_price / opportunity.last_price;
    const leverageScore = Math.min(leverage / 5, 20);
    score += leverageScore;
    if (leverage > 50) reasons.push('High leverage');
  }

  const daysToExp = Math.ceil((new Date(opportunity.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToExp >= 30 && daysToExp <= 45) {
    score += 10;
    reasons.push('Optimal timeframe');
  } else if (daysToExp >= 20 && daysToExp <= 50) {
    score += 5;
  }

  const volOiRatio = opportunity.volume / Math.max(opportunity.open_interest, 1);
  if (volOiRatio > 3) {
    score += 15;
    reasons.push('Unusual volume');
  } else if (volOiRatio > 2) {
    score += 8;
  }

  return {
    score: Math.round(score),
    reason: reasons.join(' | ') || 'Standard opportunity',
  };
}
