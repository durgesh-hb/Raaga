import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';
import { BottomNav } from './Navigation';
import { USER_PROFILE } from '../data';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { volume, setVolume } = useAudio();

  const [audioQuality, setAudioQuality] = useState<'lossless' | 'high' | 'saver'>('lossless');
  const [crossfade, setCrossfade] = useState(5);
  const [gapless, setGapless] = useState(true);

  return (
    <div className="bg-[#f4faff] dark:bg-[#0b1319] text-[#141d21] dark:text-[#e2e8f0] min-h-screen pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-[#0b1319]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 pt-safe h-auto py-3 shadow-[0_8px_32px_rgba(14,165,233,0.08)] border-b border-[#e0f2fe] dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home', 'push_back')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0ea5e9]/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]">
              arrow_back
            </span>
          </button>
          <h1 className="text-xl font-extrabold text-[#006591] dark:text-[#38bdf8]">Settings</h1>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 md:px-6 mt-8 space-y-8">
        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-bold ml-2">
            Account
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sky-shadow border border-[#e0f2fe] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0ea5e9]/30">
                  <img
                    className="w-full h-full object-cover"
                    alt={USER_PROFILE.name}
                    src={USER_PROFILE.avatarUrl}
                  />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#141d21] dark:text-white">
                    {USER_PROFILE.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8] text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span className="text-sm font-semibold text-[#006591] dark:text-[#38bdf8]">
                      Premium Member
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audio & Playback Section */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-bold ml-2">
            Playback & Audio
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden sky-shadow border border-[#e0f2fe] dark:border-slate-800">
            {/* Master Volume Slider */}
            <div className="p-6 border-b border-[#bec8d2]/30 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]">
                    {volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                  </span>
                  <div>
                    <p className="text-base font-bold text-[#141d21] dark:text-white">
                      Player Volume
                    </p>
                    <p className="text-xs text-[#3e4850] dark:text-slate-400">
                      Output volume level ({Math.round(volume * 100)}%)
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#7ed4fd]/40 rounded-lg appearance-none cursor-pointer accent-[#006591]"
              />
            </div>

            {/* Audio Quality */}
            <div className="p-6 border-b border-[#bec8d2]/30 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white">
                    Audio Quality
                  </p>
                  <p className="text-xs text-[#3e4850] dark:text-slate-400">
                    Lossless FLAC audio format stream
                  </p>
                </div>
                <span className="text-xs font-bold text-[#006591] dark:text-[#38bdf8] bg-[#7ed4fd]/30 px-3 py-1 rounded-full">
                  High-Res
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAudioQuality('lossless')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    audioQuality === 'lossless'
                      ? 'bg-[#006591] text-white'
                      : 'bg-[#e6eff5] dark:bg-slate-800 text-[#3e4850] dark:text-slate-300'
                  }`}
                >
                  24-Bit Lossless
                </button>
                <button
                  onClick={() => setAudioQuality('high')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    audioQuality === 'high'
                      ? 'bg-[#006591] text-white'
                      : 'bg-[#e6eff5] dark:bg-slate-800 text-[#3e4850] dark:text-slate-300'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setAudioQuality('saver')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    audioQuality === 'saver'
                      ? 'bg-[#006591] text-white'
                      : 'bg-[#e6eff5] dark:bg-slate-800 text-[#3e4850] dark:text-slate-300'
                  }`}
                >
                  Data Saver
                </button>
              </div>
            </div>

            {/* Gapless & Crossfade */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#3e4850] dark:text-slate-300">
                    slow_motion_video
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-bold text-[#141d21] dark:text-white">
                      Crossfade
                    </span>
                    <span className="text-xs text-[#3e4850] dark:text-slate-400">
                      Overlap duration: {crossfade} seconds
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={crossfade}
                  onChange={(e) => setCrossfade(Number(e.target.value))}
                  className="w-32 h-1.5 bg-[#7ed4fd] rounded-lg appearance-none cursor-pointer accent-[#006591]"
                />
              </div>

              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#3e4850] dark:text-slate-300">
                    skip_next
                  </span>
                  <span className="text-base font-bold text-[#141d21] dark:text-white">
                    Gapless Playback
                  </span>
                </div>
                <button
                  onClick={() => setGapless(!gapless)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                    gapless ? 'bg-[#006591]' : 'bg-[#bec8d2]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-200 ${
                      gapless ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* APPEARANCE & SYSTEM Section */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-bold ml-2">
            APPEARANCE & SYSTEM
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sky-shadow border border-[#e0f2fe] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#006591]/10 dark:bg-[#38bdf8]/15 flex items-center justify-center text-[#006591] dark:text-[#38bdf8]">
                  <span className="material-symbols-outlined">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white">
                    Dark Theme Mode
                  </p>
                  <p className="text-xs text-[#3e4850] dark:text-slate-400">
                    Toggle dark mode dynamically across all application screens
                  </p>
                </div>
              </div>

              {/* Interactive Toggle Switch Control */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#006591] dark:text-[#38bdf8]">
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full relative transition-colors duration-300 cursor-pointer p-1 shadow-inner ${
                    isDarkMode ? 'bg-[#006591] dark:bg-[#0ea5e9]' : 'bg-[#bec8d2]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#006591]">
                      {isDarkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Support & Logout */}
        <section className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 sky-shadow border border-[#e0f2fe] dark:border-slate-800 mb-8">
            <button
              onClick={() => onNavigate('login', 'push_back')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#ffdad6]/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
                <span className="text-base font-extrabold text-[#ba1a1a]">Log Out</span>
              </div>
            </button>
          </div>
        </section>
      </main>

      <BottomNav currentScreen="settings" onNavigate={onNavigate} />
    </div>
  );
};
