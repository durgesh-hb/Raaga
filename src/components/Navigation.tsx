import React from 'react';
import { ScreenType, TransitionType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const BottomNav: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-[#121212] backdrop-blur-2xl border-t border-[#282828] transition-colors duration-300">
      <button
        onClick={() => onNavigate('home', 'none')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'home'
            ? 'text-[#FFFFFF] font-bold'
            : 'text-[#B3B3B3] hover:text-[#FFFFFF]'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            currentScreen === 'home' ? 'text-[#1DB954]' : ''
          }`}
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
            ? 'text-[#FFFFFF] font-bold'
            : 'text-[#B3B3B3] hover:text-[#FFFFFF]'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            currentScreen === 'search' || currentScreen === 'results' ? 'text-[#1DB954]' : ''
          }`}
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
            ? 'text-[#FFFFFF] font-bold'
            : 'text-[#B3B3B3] hover:text-[#FFFFFF]'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            currentScreen === 'library' ? 'text-[#1DB954]' : ''
          }`}
          style={currentScreen === 'library' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          library_music
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Library</span>
      </button>

      <button
        onClick={() => onNavigate('settings', 'none')}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 px-3 transition-all duration-200 active:scale-95 cursor-pointer rounded-2xl ${
          currentScreen === 'settings'
            ? 'text-[#FFFFFF] font-bold'
            : 'text-[#B3B3B3] hover:text-[#FFFFFF]'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            currentScreen === 'settings' ? 'text-[#1DB954]' : ''
          }`}
          style={currentScreen === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          settings
        </span>
        <span className="font-semibold text-[11px] mt-0.5 tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
