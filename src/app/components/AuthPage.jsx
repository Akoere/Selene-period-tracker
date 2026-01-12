import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import logoImage from '@/assets/selene-logo.png'; 

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  // 1. Validation Logic
  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Signup Specifics
    if (!isLogin) {
      if (!name) newErrors.name = 'Name is required';
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 2. Real Authentication Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // --- LOG IN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // --- SIGN UP ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        alert('Account created! You can now log in.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // CRITICAL: Ensure redirect goes back to where you are (including mobile IP)
        options: {
          redirectTo: window.location.origin, 
        }
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md">
        
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg p-4">
             <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to Selene
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Track your cycle with confidence' : 'Start your wellness journey'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100">
          
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    // FIX APPLIED HERE: Added 'text-gray-900 placeholder-gray-400'
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none text-gray-900 placeholder-gray-400 ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-pink-400 bg-gray-50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  // FIX APPLIED HERE: Added 'text-gray-900 placeholder-gray-400'
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none text-gray-900 placeholder-gray-400 ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-pink-400 bg-gray-50 focus:bg-white'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  // FIX APPLIED HERE: Added 'text-gray-900 placeholder-gray-400'
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all focus:outline-none text-gray-900 placeholder-gray-400 ${
                    errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-pink-400 bg-gray-50 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    // FIX APPLIED HERE: Added 'text-gray-900 placeholder-gray-400'
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none text-gray-900 placeholder-gray-400 ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-pink-400 bg-gray-50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Alternative Methods - GOOGLE ONLY */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 border-2 border-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
          <p className="text-xs text-center text-gray-500">
            Your health data is encrypted and private. We never share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}