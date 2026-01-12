import { Lock, Shield, Eye } from 'lucide-react';

export function PrivacyStep() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="mb-6 relative">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>
      
      {/* FIXED: Added 'text-gray-900' */}
      <h2 className="text-2xl mb-4 font-bold text-gray-900">Your Privacy Matters</h2>
      
      <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
        We take your privacy seriously. Your health data stays private and secure.
      </p>
      
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <Lock className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <p className="text-sm text-gray-700 text-left">
            All data is encrypted and stored securely
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
          <Eye className="w-5 h-5 text-pink-500 flex-shrink-0" />
          <p className="text-sm text-gray-700 text-left">
            Only you can access your personal information
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <Shield className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <p className="text-sm text-gray-700 text-left">
            We never share your data with third parties
          </p>
        </div>
      </div>
    </div>
  );
}