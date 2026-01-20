import axios from 'axios';
import { Opportunity } from './db';

export async function sendDiscordAlert(opportunities: Opportunity[]): Promise<void> {
  const webhookUrl = 'https://discord.com/api/webhooks/1463083380454195336/M1MCtqNpbxWFXoDwlQLyzKnMYBcJM4A_sVTfZDI2wj_RbSTGFCJ5JEes0X73nulJ92NU';
  
  const top5 = opportunities.slice(0, 5);
  
  const embed = {
    title: '🎯 New Options Opportunities!',
    description: `Found ${opportunities.length} opportunities matching your criteria`,
    color: 0x10b981,
    fields: top5.map((opp) => ({
      name: `${opp.ticker} ${opp.type.toUpperCase()} - Score: ${opp.score}/100`,
      value: [
        `💰 **Price:** $${opp.last_price.toFixed(2)} | **Strike:** $${opp.strike}`,
        `📅 **Expires:** ${opp.expiration}`,
        `📊 **Volume:** ${opp.volume.toLocaleString()} | **OI:** ${opp.open_interest.toLocaleString()}`,
        opp.implied_volatility ? `📈 **IV:** ${(opp.implied_volatility * 100).toFixed(1)}%` : '',
        opp.reason ? `✨ *${opp.reason}*` : '',
      ].filter(Boolean).join('\n'),
      inline: false,
    })),
    footer: { text: 'Options Scanner' },
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(webhookUrl, {
      username: 'Options Scanner Bot',
      embeds: [embed],
    });
    console.log('✅ Discord alert sent');
  } catch (error) {
    console.error('❌ Discord alert failed');
  }
}
