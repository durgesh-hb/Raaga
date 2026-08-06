import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('alex@email.com');

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden transition-colors duration-300">
      {/* Atmospheric Background Glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1DB954]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1DB954]/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 my-auto">
        {/* Left Side: Branding & Illustration */}
        <div className="hidden md:flex flex-col space-y-8 pr-8">
          <header className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg shadow-[#1DB954]/30">
              <span className="material-symbols-outlined text-black text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                graphic_eq
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">RAAGA</h1>
          </header>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Music for <br />
              <span className="text-[#1DB954]">everyone.</span>
            </h2>
            <p className="text-lg text-[#B3B3B3] max-w-md">
              Millions of songs and podcasts. High-fidelity audio with a modern dark mode interface built for seamless music discovery.
            </p>
          </div>

          {/* Hero Illustration Component */}
          <div className="relative w-full aspect-square max-w-sm floating">
            <div className="absolute inset-0 bg-[#1DB954]/10 rounded-[40px] rotate-6 scale-95" />
            <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border border-[#282828]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUYtn9UvrTr_AsKx9gjtxW1M1PGYQNIQLMX4k2aBCELHPxZjjZyebChJoa9fLpsehBhDxEvNuXKIdM0DtQzy5sjKa8Mw9ycen1y_nzcoyqf01Fy02szjJXIw4MNmY1-MKnviLm5oD4SEOQoDR_R1EfABpNfPAah1DtkAYrd_yFIGoRGzWeUgLppc688TP5tbm0qZVDuZ9QbL5TYA962Jqd6mBAeyryeg0tz6oWWnPdb9ngkNmrwAxLx6qWnL4zYTQ7GCvwXxJBTf_')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-transparent" />
            </div>

            {/* Floating Micro-UI element */}
            <div className="absolute bottom-6 -right-6 bg-[#282828] border border-[#3E3E3E] p-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
                <span className="material-symbols-outlined text-black font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
              <div>
                <div className="h-2 w-24 bg-[#1DB954]/80 rounded-full mb-2" />
                <div className="h-2 w-16 bg-[#B3B3B3]/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full flex flex-col items-center">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg shadow-[#1DB954]/30 mb-3">
              <span className="material-symbols-outlined text-black text-4xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                graphic_eq
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">RAAGA</h1>
          </div>

          <div className="bg-[#181818] border border-[#282828] w-full p-6 md:p-10 rounded-[32px] shadow-2xl flex flex-col">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Welcome back</h2>
              <p className="text-base text-[#B3B3B3] font-medium">Log in to your RAAGA account.</p>
            </div>

            {/* Social Login Button */}
            <button
              onClick={() => onNavigate('home', 'push')}
              className="w-full h-14 bg-[#282828] border border-[#3E3E3E] hover:border-white transition-all duration-300 rounded-full flex items-center justify-center space-x-3 group shadow-sm active:scale-[0.98] cursor-pointer"
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
              <span className="text-sm font-bold text-white">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center space-x-4">
              <div className="h-[1px] flex-1 bg-[#282828]" />
              <span className="text-xs text-[#B3B3B3] uppercase tracking-widest font-mono">OR</span>
              <div className="h-[1px] flex-1 bg-[#282828]" />
            </div>

            {/* Input Fields */}
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#B3B3B3] ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    className="w-full h-14 bg-[#282828] border border-[#3E3E3E] text-white placeholder-[#B3B3B3] rounded-full px-5 text-base focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] outline-none"
                    placeholder="alex@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#B3B3B3] group-focus-within:text-[#1DB954]">
                    mail
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onNavigate('home', 'push')}
              className="w-full h-14 bg-[#1DB954] hover:bg-[#1ED760] text-black text-base font-extrabold rounded-full shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 mb-6 cursor-pointer"
            >
              Continue with Email
            </button>

            {/* Secondary Actions */}
            <div className="flex flex-col space-y-3 items-center text-sm">
              <p className="text-[#B3B3B3]">
                Don't have an account?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home', 'push');
                  }}
                  className="text-white font-bold hover:text-[#1DB954] hover:underline ml-1"
                >
                  Sign up for RAAGA
                </a>
              </p>
            </div>
          </div>

          <footer className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[#B3B3B3]">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>© 2026 RAAGA Stream</span>
          </footer>
        </div>
      </main>
    </div>
  );
};
