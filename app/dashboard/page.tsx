'use client';

import { useEffect, useState } from 'react';
import { Opportunity } from '@/lib/db';
import OpportunityCard from '@/components/OpportunityCard';
import FilterPanel from '@/components/FilterPanel';
import StatsPanel from '@/components/StatsPanel';

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({ total: 0, avg_score: 0, max_score: 0, unique_tickers: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [minScore, setMinScore] = useState(60);
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>('all');

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 60000);
    return () => clearInterval(interval);
  }, [minScore]);

  async function fetchOpportunities() {
    try {
      const res = await fetch(`/api/opportunities?minScore=${minScore}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerScan() {
    setScanning(true);
    try {
      const res = await fetch('/api/scan');
      const data = await res.json();
      if (data.success) {
        alert(`Scan complete! Found ${data.scan.opportunitiesFound} opportunities`);
        fetchOpportunities();
      } else {
        alert(data.message || 'Scan failed');
      }
    } catch (error) {
      alert('Scan failed');
    } finally {
      setScanning(false);
    }
  }

  const filtered = opportunities.filter((opp) => {
    if (optionType !== 'all' && opp.type !== optionType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Options Scanner</h1>
              <p className="text-gray-600 mt-1">Finding $1-$10 opportunities</p>
            </div>
            <button
              onClick={triggerScan}
              disabled={scanning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                scanning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {scanning ? 'Scanning...' : 'Run Scan Now'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <StatsPanel stats={stats} />
        <FilterPanel
          minScore={minScore}
          setMinScore={setMinScore}
          optionType={optionType}
          setOptionType={setOptionType}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp, idx) => (
              <OpportunityCard key={idx} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-xl text-gray-600">No opportunities found</p>
            <button
              onClick={triggerScan}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Run a Scan
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
