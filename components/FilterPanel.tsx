'use client';

interface FilterPanelProps {
  minScore: number;
  setMinScore: (score: number) => void;
  optionType: 'all' | 'call' | 'put';
  setOptionType: (type: 'all' | 'call' | 'put') => void;
}

export default function FilterPanel({
  minScore,
  setMinScore,
  optionType,
  setOptionType,
}: FilterPanelProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Score: {minScore}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Option Type</label>
          <select
            value={optionType}
            onChange={(e) => setOptionType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Options</option>
            <option value="call">Calls Only</option>
            <option value="put">Puts Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
