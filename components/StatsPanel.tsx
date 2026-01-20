'use client';

interface Stats {
  total: number;
  avg_score: number;
  max_score: number;
  unique_tickers: number;
}

export default function StatsPanel({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Avg Score</p>
        <p className="text-3xl font-bold text-gray-900">{stats.avg_score}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Max Score</p>
        <p className="text-3xl font-bold text-gray-900">{stats.max_score}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Stocks</p>
        <p className="text-3xl font-bold text-gray-900">{stats.unique_tickers}</p>
      </div>
    </div>
  );
}
