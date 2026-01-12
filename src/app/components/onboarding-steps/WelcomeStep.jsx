import logoImage from '@/assets/selene-logo.png';

export function WelcomeStep() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      
      {/* Logo Section */}
      <div className="mb-8 relative">
         <img 
           src={logoImage} 
           alt="Selene Logo" 
           // INCREASED SIZE: w-48 h-48
           className="w-43 h-43 object-contain mx-auto drop-shadow-xl" 
         />
         
         {/* Adjusted glow to be proportional */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-400/20 blur-3xl rounded-full -z-10" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Welcome to Selene
      </h1>
      
      <p className="text-gray-600 mb-6 max-w-sm leading-relaxed">
        Your personal health companion for tracking your menstrual cycle, symptoms, and overall wellness.
      </p>
      
      <div className="bg-pink-50 rounded-2xl p-4 max-w-sm border border-pink-100">
        <p className="text-sm text-gray-700">
          Take control of your health with personalized insights and predictions.
        </p>
      </div>
    </div>
  );
}