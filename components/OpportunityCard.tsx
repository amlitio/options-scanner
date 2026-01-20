'use client';

import { Opportunity } from '@/lib/db';

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const daysToExp = Math.ceil(
    (new Date(opportunity.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isCall = opportunity.type === 'call';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{opportunity.ticker}</h3>
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              isCall ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {opportunity.type.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            ${opportunity.last_price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">per contract</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Score</span>
          <span className="font-bold text-green-600">{opportunity.score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              opportunity.score >= 80 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${opportunity.score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Strike</span>
          <span className="font-semibold">${opportunity.strike}</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Expires</span>
          <span className="font-semibold">{daysToExp}d</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Volume</span>
          <span className="font-semibold">{opportunity.volume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">OI</span>
          <span className="font-semibold">{opportunity.open_interest.toLocaleString()}</span>
        </div>
      </div>

      {opportunity.reason && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800 font-medium">{opportunity.reason}</p>
        </div>
      )}

      <button
        onClick={() => window.open(`https://robinhood.com/stocks/${opportunity.ticker}`, '_blank')}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        View on Robinhood →
      </button>
    </div>
  );
}
