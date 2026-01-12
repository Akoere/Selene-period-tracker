import { Calendar, TrendingUp, Bell } from 'lucide-react';

export function FeaturesStep() {
  const features = [
    {
      icon: Calendar,
      title: 'Cycle Tracking',
      description: 'Track your period and predict upcoming cycles with accuracy',
      color: 'from-pink-400 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Health Insights',
      description: 'Understand patterns in your symptoms and mood over time',
      color: 'from-purple-400 to-purple-500',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified about upcoming periods and important dates',
      color: 'from-pink-300 to-purple-400',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        {/* FIXED: Added 'text-gray-900' to ensure visibility */}
        <h2 className="text-2xl mb-2 font-bold text-gray-900">Everything You Need</h2>
        <p className="text-gray-600">Powerful features designed for your wellness</p>
      </div>
      
      <div className="flex-1 space-y-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex gap-4 items-start p-4 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                {/* FIXED: Added 'text-gray-900' */}
                <h3 className="mb-1 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}