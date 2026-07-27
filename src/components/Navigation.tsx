import React from 'react';
import { ScreenType, TransitionType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const BottomNav: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-white/90 dark:bg-[#0b1319]/90 backdrop-blur-2xl border-t border-[#bec8d2]/30 dark:border-slate-800/80 shadow-[0_-4px_24px_rgba(14,165,233,0.12)] transition-colors duration-300">
      <button
        onClick={() => onNavigate('home', 'none')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'home'
            ? 'text-[#006591] dark:text-[#38bdf8] bg-[#7ed4fd]/30 dark:bg-[#38bdf8]/20 font-bold shadow-sm'
            : 'text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8]'
        }`}
      >
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={currentScreen === 'home' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          home
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Home</span>
      </button>

      <button
        onClick={() => onNavigate('search', 'none')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'search' || currentScreen === 'results'
            ? 'text-[#006591] dark:text-[#38bdf8] bg-[#7ed4fd]/30 dark:bg-[#38bdf8]/20 font-bold shadow-sm'
            : 'text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8]'
        }`}
      >
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={
            currentScreen === 'search' || currentScreen === 'results'
              ? { fontVariationSettings: "'FILL' 1" }
              : {}
          }
        >
          search
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Search</span>
      </button>

      <button
        onClick={() => onNavigate('library', 'none')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'library'
            ? 'text-[#006591] dark:text-[#38bdf8] bg-[#7ed4fd]/30 dark:bg-[#38bdf8]/20 font-bold shadow-sm'
            : 'text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8]'
        }`}
      >
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={currentScreen === 'library' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          library_music
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Library</span>
      </button>

      <button
        onClick={() => onNavigate('settings', 'push')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'settings'
            ? 'text-[#006591] dark:text-[#38bdf8] bg-[#7ed4fd]/30 dark:bg-[#38bdf8]/20 font-bold shadow-sm'
            : 'text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8]'
        }`}
      >
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={currentScreen === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          workspace_premium
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Premium</span>
      </button>
    </nav>
  );
};
