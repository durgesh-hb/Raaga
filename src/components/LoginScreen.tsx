import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('alex@email.com');

  return (
    <div className="sky-gradient min-h-screen flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden transition-colors duration-300">
      {/* Atmospheric Background Decoration */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#006591]/10 dark:bg-[#38bdf8]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#006686]/10 dark:bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 my-auto">
        {/* Left Side: Branding & Illustration */}
        <div className="hidden md:flex flex-col space-y-8 pr-8">
          <header className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-[#006591]/20">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#006591] dark:text-[#38bdf8] tracking-tight">RAGGA</h1>
          </header>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#141d21] dark:text-white leading-tight">
              Your music, <br />
              <span className="text-[#0ea5e9] dark:text-[#38bdf8]">light as air.</span>
            </h2>
            <p className="text-lg text-[#3e4850] dark:text-slate-300 max-w-md">
              Experience a revolutionary way to stream. High-fidelity audio meets a weightless interface designed for absolute focus.
            </p>
          </div>

          {/* Hero Illustration Component */}
          <div className="relative w-full aspect-square max-w-sm floating">
            <div className="absolute inset-0 bg-[#006591]/5 rounded-[40px] rotate-6 scale-95" />
            <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.15)] border border-white/50 dark:border-white/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUYtn9UvrTr_AsKx9gjtxW1M1PGYQNIQLMX4k2aBCELHPxZjjZyebChJoa9fLpsehBhDxEvNuXKIdM0DtQzy5sjKa8Mw9ycen1y_nzcoyqf01Fy02szjJXIw4MNmY1-MKnviLm5oD4SEOQoDR_R1EfABpNfPAah1DtkAYrd_yFIGoRGzWeUgLppc688TP5tbm0qZVDuZ9QbL5TYA962Jqd6mBAeyryeg0tz6oWWnPdb9ngkNmrwAxLx6qWnL4zYTQ7GCvwXxJBTf_')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006591]/40 to-transparent" />
            </div>

            {/* Floating Micro-UI element */}
            <div className="absolute bottom-6 -right-6 glass-card p-4 rounded-2xl shadow-xl flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-[#006686] flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
              <div>
                <div className="h-2 w-24 bg-[#3e4850]/20 dark:bg-white/20 rounded-full mb-2" />
                <div className="h-2 w-16 bg-[#3e4850]/10 dark:bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full flex flex-col items-center">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-lg shadow-[#006591]/20 mb-3">
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#006591] dark:text-[#38bdf8]">RAGGA</h1>
          </div>

          <div className="glass-card w-full p-6 md:p-10 rounded-[32px] shadow-[0_8px_32px_rgba(14,165,233,0.12)] flex flex-col">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#141d21] dark:text-white mb-1">Welcome back</h2>
              <p className="text-base text-[#3e4850] dark:text-slate-300 font-medium">Elevate your listening experience today.</p>
            </div>

            {/* Social Login Button */}
            <button
              onClick={() => onNavigate('home', 'push')}
              className="w-full h-14 bg-white dark:bg-slate-800 border border-[#bec8d2] dark:border-slate-700 hover:border-[#0ea5e9] transition-all duration-300 rounded-2xl flex items-center justify-center space-x-3 group shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-bold text-[#141d21] dark:text-white">Connect with Google</span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center space-x-4">
              <div className="h-[1px] flex-1 bg-[#bec8d2]/30 dark:bg-slate-700" />
              <span className="text-xs text-[#3e4850]/60 dark:text-slate-400 uppercase tracking-widest font-mono">OR</span>
              <div className="h-[1px] flex-1 bg-[#bec8d2]/30 dark:bg-slate-700" />
            </div>

            {/* Input Fields */}
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#3e4850] dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    className="w-full h-14 bg-[#ecf5fb] dark:bg-slate-800 border border-[#bec8d2] dark:border-slate-700 text-[#141d21] dark:text-white rounded-xl px-5 text-base focus:ring-2 focus:ring-[#0ea5e9] outline-none"
                    placeholder="alex@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3e4850]/40 dark:text-slate-400 group-focus-within:text-[#0ea5e9]">
                    mail
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onNavigate('home', 'push')}
              className="w-full h-14 bg-[#006591] dark:bg-[#0ea5e9] text-white text-base font-extrabold rounded-2xl shadow-lg hover:bg-[#004c6e] transition-all duration-300 active:scale-95 mb-6 cursor-pointer"
            >
              Continue with Email
            </button>

            {/* Secondary Actions */}
            <div className="flex flex-col space-y-3 items-center text-sm">
              <p className="text-[#3e4850] dark:text-slate-300">
                New to the sky?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home', 'push');
                  }}
                  className="text-[#006591] dark:text-[#38bdf8] font-bold hover:underline ml-1"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>

          <footer className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[#3e4850]/60 dark:text-slate-400">
            <a href="#" className="hover:text-[#006591] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#006591] transition-colors">Terms of Service</a>
            <span>© 2024 RAGGA Music</span>
          </footer>
        </div>
      </main>
    </div>
  );
};
