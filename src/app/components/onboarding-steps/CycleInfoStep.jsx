import { Calendar } from 'lucide-react';

export function CycleInfoStep({ data, update }) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="inline-flex w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        {/* FIXED: Added 'text-gray-900' */}
        <h2 className="text-2xl mb-2 font-bold text-gray-900">Cycle Information</h2>
        <p className="text-gray-600 text-sm">Help us personalize your experience</p>
      </div>
      
      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-sm mb-2 text-gray-700">When did your last period start?</label>
          <input
            type="date"
            value={data.lastPeriodDate} 
            onChange={(e) => update('lastPeriodDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            // FIXED: Added 'text-gray-900' to input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-700">Average cycle length (days)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="21"
              max="35"
              value={data.cycleLength}
              onChange={(e) => update('cycleLength', e.target.value)}
              className="flex-1 accent-pink-400"
            />
            <span className="text-lg font-medium text-gray-700 w-12 text-center bg-pink-50 rounded-lg py-2">
              {data.cycleLength}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Most common: 28 days</p>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-700">Period duration (days)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="3"
              max="7"
              value={data.periodLength}
              onChange={(e) => update('periodLength', e.target.value)}
              className="flex-1 accent-purple-400"
            />
            <span className="text-lg font-medium text-gray-700 w-12 text-center bg-purple-50 rounded-lg py-2">
              {data.periodLength}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Average: 4-5 days</p>
        </div>
      </div>
    </div>
  );
}