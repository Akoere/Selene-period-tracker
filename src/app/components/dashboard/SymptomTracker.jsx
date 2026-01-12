import { useState } from 'react';
import { Plus, Smile, Frown, Meh, Zap, Moon, Activity, Heart } from 'lucide-react';

export function SymptomTracker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(['cramps']);
  const [mood, setMood] = useState('neutral');

  const symptoms = [
    { id: 'cramps', label: 'Cramps', icon: '💢', category: 'pain' },
    { id: 'headache', label: 'Headache', icon: '🤕', category: 'pain' },
    { id: 'bloating', label: 'Bloating', icon: '💨', category: 'digestive' },
    { id: 'acne', label: 'Acne', icon: '🔴', category: 'skin' },
    { id: 'fatigue', label: 'Fatigue', icon: '😴', category: 'energy' },
    { id: 'cravings', label: 'Cravings', icon: '🍫', category: 'appetite' },
    { id: 'tender', label: 'Tender Breasts', icon: '💝', category: 'physical' },
    { id: 'backpain', label: 'Back Pain', icon: '🔙', category: 'pain' },
  ];

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const moods = [
    { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
    { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
    { id: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Today's Log</h3>
          <span className="text-sm text-gray-500">January 6, 2026</span>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How are you feeling?
          </label>
          <div className="flex gap-3">
            {moods.map((moodOption) => {
              const Icon = moodOption.icon;
              const isSelected = mood === moodOption.id;
              return (
                <button
                  key={moodOption.id}
                  onClick={() => setMood(moodOption.id)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${moodOption.color}`} />
                  <p className="text-xs font-medium text-gray-700">{moodOption.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Track symptoms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {symptoms.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{symptom.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{symptom.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button className="w-full mt-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-md hover:shadow-lg font-medium">
          Save Today's Log
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-pink-500" />
            <p className="text-xs text-gray-600">Energy</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">Medium</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-purple-500" />
            <p className="text-xs text-gray-600">Sleep</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">7.5h</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <p className="text-xs text-gray-600">Flow</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">Light</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <p className="text-xs text-gray-600">Wellness</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">Good</p>
        </div>
      </div>
    </div>
  );
}