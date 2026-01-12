import { Settings } from 'lucide-react';

// FIXED: Now accepts 'data' and 'update' props from parent
export function PreferencesStep({ data, update }) {
  // Use data.goals and data.notifications instead of local state
  const selectedGoals = data.goals || [];
  const notifications = data.notifications;

  const goals = [
    { id: 'track', label: 'Track my cycle', emoji: '📝' },
    { id: 'pregnancy', label: 'Plan pregnancy', emoji: '👶' },
    { id: 'symptoms', label: 'Monitor symptoms', emoji: '🌡️' },
    { id: 'wellness', label: 'Overall wellness', emoji: '🧘‍♀️' },
  ];

  const toggleGoal = (goalId) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    // Update parent state
    update('goals', newGoals);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="inline-flex w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl mb-2">Your Goals</h2>
        <p className="text-gray-600 text-sm">What would you like to focus on?</p>
      </div>
      
      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-sm mb-3 text-gray-700">
            Select all that apply
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedGoals.includes(goal.id)
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{goal.emoji}</div>
                <p className="text-sm font-medium text-gray-700">{goal.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Period reminders
              </p>
              <p className="text-xs text-gray-500">
                Get notified before your period starts
              </p>
            </div>
            <button
              onClick={() => update('notifications', !notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            ℹ️ These preferences help us provide better predictions
          </p>
        </div>
      </div>
    </div>
  );
}