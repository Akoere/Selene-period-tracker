import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { updateProfile, saveDailyLog } from '@/lib/api';

// Steps
import { WelcomeStep } from './onboarding-steps/WelcomeStep';
import { FeaturesStep } from './onboarding-steps/FeaturesStep';
import { PrivacyStep } from './onboarding-steps/PrivacyStep';
import { CycleInfoStep } from './onboarding-steps/CycleInfoStep';
import { PreferencesStep } from './onboarding-steps/PreferencesStep';

export function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  // Central State for all steps
  const [formData, setFormData] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodLength: 5,
    goals: [],
    notifications: true
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 1. Save Profile Settings
      await updateProfile(user.id, {
        cycle_length: parseInt(formData.cycleLength),
        period_length: parseInt(formData.periodLength),
        is_onboarded: true // MARK AS COMPLETE
      });
      
      // Save to LocalStorage for immediate persistence
      localStorage.setItem(`selene_onboarded_${user.id}`, 'true');

      // 2. Log the "Last Period" if provided
      if (formData.lastPeriodDate) {
        // We log "Medium" flow on that date so the calculator works
        await saveDailyLog(user.id, formData.lastPeriodDate, {
          flow_level: 'Medium',
          notes: 'Logged during onboarding'
        });
      }

      onComplete(); // Tell App.jsx we are done
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("Failed to save setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Validation Logic
  const isStepValid = () => {
    if (currentStep === 3) { // Cycle Info Step
      // Must have a date selected
      return formData.lastPeriodDate && formData.lastPeriodDate !== '';
    }
    return true;
  };

  // Render the current step with props
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep />;
      case 1: return <FeaturesStep />;
      case 2: return <PrivacyStep />;
      // Pass data & handlers to input steps
      case 3: return <CycleInfoStep data={formData} update={updateFormData} />;
      case 4: return <PreferencesStep data={formData} update={updateFormData} />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div className="size-full bg-linear-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full mx-1 transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-linear-to-r from-pink-400 to-purple-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">Step {currentStep + 1} of {totalSteps}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 min-h-[500px] flex flex-col">
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={saving || !isStepValid()}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-400 to-purple-400 text-white rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:grayscale"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {currentStep === totalSteps - 1 ? "Get Started" : "Continue"}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}