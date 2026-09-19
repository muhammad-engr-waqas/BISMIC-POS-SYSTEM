import React, { useState } from 'react';
import { DataService } from '../../services/storage';
import { User } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Lock, User as UserIcon } from 'lucide-react';

export interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const toast = useToast();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = DataService.authenticate(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        toast.success(`Welcome back, ${result.user.name}!`);
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Invalid username or password.');
      }
    }, 200);
  };

  const handleQuickLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setIsLoading(true);
    setTimeout(() => {
      const result = DataService.authenticate(demoUser, demoPass);
      setIsLoading(false);
      if (result.success && result.user) {
        toast.success(`Signed in as ${result.user.name}`);
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Authentication error.');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#110f0e] text-[#f5f2eb] flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden select-none font-sans">
      {/* Subtle ambient warmth matching brand palette */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#ea6918]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fadeIn">
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-2xl bg-[#110f0e] border border-[#2b241f]">
            <img
              src="/bismic-logo.jpg"
              alt="Bismic Restaurant"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#191614] rounded-2xl border border-[#2c2520] p-7 shadow-xl shadow-black/40">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-[#a89d91] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756a5f]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="block w-full rounded-xl border border-[#2d2621] bg-[#110f0e] text-[#f5f2eb] placeholder-[#6e6358] pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#ea6918] focus:ring-2 focus:ring-[#ea6918]/20 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a89d91] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#756a5f]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-[#2d2621] bg-[#110f0e] text-[#f5f2eb] placeholder-[#6e6358] pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#ea6918] focus:ring-2 focus:ring-[#ea6918]/20 transition-all duration-200"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#ea6918] hover:bg-[#d45c0f] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-md shadow-[#ea6918]/15 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Clean Quick Access Pills */}
          <div className="mt-6 pt-5 border-t border-[#26201b]">
            <p className="text-[11px] font-medium text-[#8c8074] uppercase tracking-wider text-center mb-2.5">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="px-2.5 py-2 rounded-lg bg-[#110f0e] hover:bg-[#221e1a] border border-[#2a231e] hover:border-[#ea6918]/40 text-xs font-medium text-[#d9d0c5] hover:text-[#ea6918] text-center transition-all duration-150 cursor-pointer"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('riyadh', 'riyadh123')}
                className="px-2.5 py-2 rounded-lg bg-[#110f0e] hover:bg-[#221e1a] border border-[#2a231e] hover:border-[#ea6918]/40 text-xs font-medium text-[#d9d0c5] hover:text-[#ea6918] text-center transition-all duration-150 cursor-pointer"
              >
                Riyadh
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('jeddah', 'jeddah123')}
                className="px-2.5 py-2 rounded-lg bg-[#110f0e] hover:bg-[#221e1a] border border-[#2a231e] hover:border-[#ea6918]/40 text-xs font-medium text-[#d9d0c5] hover:text-[#ea6918] text-center transition-all duration-150 cursor-pointer"
              >
                Jeddah
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dammam', 'dammam123')}
                className="px-2.5 py-2 rounded-lg bg-[#110f0e] hover:bg-[#221e1a] border border-[#2a231e] hover:border-[#ea6918]/40 text-xs font-medium text-[#d9d0c5] hover:text-[#ea6918] text-center transition-all duration-150 cursor-pointer"
              >
                Dammam
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-[#61574d] mt-6">
          Bismic Restaurant POS System
        </p>
      </div>
    </div>
  );
};
