import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, TransitionType } from '../types';
import { BottomNav } from './Navigation';
import { USER_PROFILE } from '../data';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { MusicApiService } from '../services/musicApiService';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

type ModalType = 'account' | 'equalizer' | 'storage' | 'about' | 'logout' | null;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { volume, setVolume } = useAudio();

  // Settings State
  const [audioQuality, setAudioQuality] = useState<'lossless' | 'high' | 'saver'>('lossless');
  const [crossfade, setCrossfade] = useState<number>(5);
  const [gapless, setGapless] = useState<boolean>(true);
  const [eqPreset, setEqPreset] = useState<string>('Bass Boost');
  const [bassEnhancer, setBassEnhancer] = useState<boolean>(true);
  const [surroundSound, setSurroundSound] = useState<boolean>(false);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  // Modal Control State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Smart Back Navigation & Dismissal Handling
  const handleBack = useCallback(() => {
    if (activeModal !== null) {
      setActiveModal(null);
    } else {
      onNavigate('home', 'push_back');
    }
  }, [activeModal, onNavigate]);

  // Keyboard Escape & Hardware Back Dismissal Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal !== null) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // Check Java Backend Health when About Modal opens
  useEffect(() => {
    if (activeModal === 'about') {
      const checkBackend = async () => {
        setBackendStatus('checking');
        const startTime = performance.now();
        try {
          const isHealthy = await MusicApiService.checkHealth();
          const endTime = performance.now();
          setLatency(Math.round(endTime - startTime));
          setBackendStatus(isHealthy ? 'online' : 'offline');
        } catch {
          setBackendStatus('offline');
          setLatency(null);
        }
      };
      checkBackend();
    }
  }, [activeModal]);

  // Clear Cache Action
  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      setCacheCleared(false);
      setActiveModal(null);
    }, 1500);
  };

  return (
    <div className="bg-[#f4faff] dark:bg-[#0b1319] text-[#141d21] dark:text-[#e2e8f0] min-h-screen pb-36 transition-colors duration-300 relative">
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-[#0b1319]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 py-3.5 shadow-[0_8px_32px_rgba(14,165,233,0.08)] border-b border-[#e0f2fe] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#006591]/10 dark:bg-slate-800 text-[#006591] dark:text-[#38bdf8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#006591] dark:text-[#38bdf8] tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] text-[#6e7881] dark:text-slate-400 font-medium">
              Preferences & Audio Engine
            </p>
          </div>
        </div>

        {/* Quick Modal Indicator Badge */}
        {activeModal && (
          <span className="text-xs font-bold text-[#006591] dark:text-[#38bdf8] bg-[#0ea5e9]/15 px-3 py-1 rounded-full animate-pulse">
            Sub-Menu Open
          </span>
        )}
      </header>

      {/* Main Settings Container */}
      <main className="max-w-[800px] mx-auto px-4 md:px-6 mt-6 space-y-6">
        
        {/* ACCOUNT SECTION */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-extrabold ml-2">
            Account & Subscription
          </h2>
          <div
            onClick={() => setActiveModal('account')}
            className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sky-shadow border border-[#e0f2fe] dark:border-slate-800 hover:border-[#0ea5e9]/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#0ea5e9] shadow-md group-hover:scale-105 transition-transform">
                  <img
                    className="w-full h-full object-cover"
                    alt={USER_PROFILE.name}
                    src={USER_PROFILE.avatarUrl}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#141d21] dark:text-white group-hover:text-[#006591] dark:group-hover:text-[#38bdf8] transition-colors">
                    {USER_PROFILE.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8] text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span className="text-xs font-bold text-[#006591] dark:text-[#38bdf8]">
                      Premium Hi-Fi Member
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#006591] dark:text-[#38bdf8] font-bold text-sm">
                <span>Manage</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PLAYBACK & AUDIO SECTION */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-extrabold ml-2">
            Playback & Sound Engine
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden sky-shadow border border-[#e0f2fe] dark:border-slate-800 divide-y divide-[#e0f2fe] dark:divide-slate-800/60">
            
            {/* Master Volume Slider */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]">
                    {volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                  </span>
                  <div>
                    <p className="text-base font-bold text-[#141d21] dark:text-white">
                      Player Volume
                    </p>
                    <p className="text-xs text-[#6e7881] dark:text-slate-400">
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
                className="w-full h-2 bg-[#e0f2fe] dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#006591] dark:accent-[#38bdf8]"
              />
            </div>

            {/* Audio Quality Selector */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white">
                    Streaming Quality
                  </p>
                  <p className="text-xs text-[#6e7881] dark:text-slate-400">
                    Lossless FLAC audio streaming format
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#006591] dark:text-[#38bdf8] bg-[#0ea5e9]/15 px-3 py-1 rounded-full">
                  High-Res FLAC
                </span>
              </div>
              <div className="flex gap-2">
                {(['lossless', 'high', 'saver'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAudioQuality(mode)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                      audioQuality === mode
                        ? 'bg-[#006591] dark:bg-[#0ea5e9] text-white shadow-md'
                        : 'bg-[#ecf5fb] dark:bg-slate-800 text-[#3e4850] dark:text-slate-300 hover:bg-[#e0f2fe]'
                    }`}
                  >
                    {mode === 'lossless'
                      ? '24-Bit Lossless'
                      : mode === 'high'
                      ? '320kbps High'
                      : 'Data Saver'}
                  </button>
                ))}
              </div>
            </div>

            {/* Equalizer & Sound Effects Trigger */}
            <div
              onClick={() => setActiveModal('equalizer')}
              className="p-5 flex items-center justify-between hover:bg-[#ecf5fb] dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006591]/10 dark:bg-[#38bdf8]/15 flex items-center justify-center text-[#006591] dark:text-[#38bdf8]">
                  <span className="material-symbols-outlined">equalizer</span>
                </div>
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white group-hover:text-[#006591] dark:group-hover:text-[#38bdf8] transition-colors">
                    Equalizer & Sound FX
                  </p>
                  <p className="text-xs text-[#6e7881] dark:text-slate-400">
                    Preset: <span className="font-semibold text-[#006591] dark:text-[#38bdf8]">{eqPreset}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#006591] dark:text-[#38bdf8]">
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Crossfade & Gapless */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#6e7881] dark:text-slate-400">
                    slow_motion_video
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#141d21] dark:text-white">
                      Crossfade Overlap
                    </p>
                    <p className="text-xs text-[#6e7881] dark:text-slate-400">
                      Duration: {crossfade} seconds
                    </p>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={crossfade}
                  onChange={(e) => setCrossfade(Number(e.target.value))}
                  className="w-28 h-1.5 bg-[#e0f2fe] dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#006591] dark:accent-[#38bdf8]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#6e7881] dark:text-slate-400">
                    skip_next
                  </span>
                  <p className="text-sm font-bold text-[#141d21] dark:text-white">
                    Gapless Playback
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gapless}
                  onClick={() => setGapless(!gapless)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer p-0.5 ${
                    gapless ? 'bg-[#006591] dark:bg-[#0ea5e9]' : 'bg-[#bec8d2] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      gapless ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* STORAGE & CACHE SECTION */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-extrabold ml-2">
            Storage & Data Management
          </h2>
          <div
            onClick={() => setActiveModal('storage')}
            className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sky-shadow border border-[#e0f2fe] dark:border-slate-800 hover:border-[#0ea5e9]/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006591]/10 dark:bg-[#38bdf8]/15 flex items-center justify-center text-[#006591] dark:text-[#38bdf8]">
                  <span className="material-symbols-outlined">sd_card</span>
                </div>
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white group-hover:text-[#006591] dark:group-hover:text-[#38bdf8] transition-colors">
                    Storage & Cache Usage
                  </p>
                  <p className="text-xs text-[#6e7881] dark:text-slate-400">
                    306.4 MB stored (Audio & Artwork)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#006591] dark:text-[#38bdf8]">
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* APPEARANCE & SYSTEM DIAGNOSTICS */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#6e7881] dark:text-slate-400 font-extrabold ml-2">
            Appearance & System
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sky-shadow border border-[#e0f2fe] dark:border-slate-800 divide-y divide-[#e0f2fe] dark:divide-slate-800/60">
            
            {/* Theme Toggle */}
            <div className="pb-4 flex items-center justify-between">
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
                  <p className="text-xs text-[#6e7881] dark:text-slate-400">
                    Dynamic theme application state
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#006591] dark:text-[#38bdf8]">
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={toggleTheme}
                  className={`w-12 h-7 rounded-full relative transition-colors duration-300 cursor-pointer p-1 shadow-inner ${
                    isDarkMode ? 'bg-[#006591] dark:bg-[#0ea5e9]' : 'bg-[#bec8d2]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                      isDarkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px] text-[#006591]">
                      {isDarkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* About & Backend Diagnostics */}
            <div
              onClick={() => setActiveModal('about')}
              className="pt-4 flex items-center justify-between hover:bg-[#ecf5fb] dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#006591]/10 dark:bg-[#38bdf8]/15 flex items-center justify-center text-[#006591] dark:text-[#38bdf8]">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <div>
                  <p className="text-base font-bold text-[#141d21] dark:text-white group-hover:text-[#006591] dark:group-hover:text-[#38bdf8] transition-colors">
                    About & Backend Status
                  </p>
                  <p className="text-xs text-[#6e7881] dark:text-slate-400">
                    Version v2.4.0 • Spring Boot Server Info
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#006591] dark:text-[#38bdf8]">
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* LOGOUT BUTTON */}
        <section className="pt-2">
          <button
            onClick={() => setActiveModal('logout')}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-[#ba1a1a] dark:text-red-400 p-4 rounded-[24px] border border-red-500/20 font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Log Out Account</span>
          </button>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* ANMATED OVERLAY & MODAL BOTTOM SHEETS (motion/react)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal !== null && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />

            {/* 1. ACCOUNT & SUBSCRIPTION SHEET */}
            {activeModal === 'account' && (
              <motion.div
                key="modal-account"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#e0f2fe] dark:border-slate-800 max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0ea5e9] shadow-lg">
                      <img className="w-full h-full object-cover" alt="User" src={USER_PROFILE.avatarUrl} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#141d21] dark:text-white">
                        {USER_PROFILE.name}
                      </h3>
                      <p className="text-xs text-[#6e7881] dark:text-slate-400">nithin@ragga.stream</p>
                      <span className="inline-block mt-1 px-3 py-0.5 bg-[#0ea5e9]/15 text-[#006591] dark:text-[#38bdf8] text-[11px] font-extrabold rounded-full">
                        Hi-Fi Family Plan
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="space-y-4 text-sm text-[#3e4850] dark:text-slate-300">
                  <div className="p-4 bg-[#ecf5fb] dark:bg-slate-800 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#141d21] dark:text-white">Auto-Renewal Date</p>
                      <p className="text-xs text-[#6e7881] dark:text-slate-400">Renews on August 28, 2026</p>
                    </div>
                    <span className="text-xs font-extrabold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="p-4 bg-[#ecf5fb] dark:bg-slate-800 rounded-2xl">
                    <p className="font-bold text-[#141d21] dark:text-white mb-2">Connected Devices (3/5)</p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex justify-between">
                        <span>📱 iPhone 15 Pro (This Device)</span>
                        <span className="text-green-500 font-bold">Online</span>
                      </li>
                      <li className="flex justify-between text-slate-400">
                        <span>💻 MacBook Pro M3</span>
                        <span>Active 2h ago</span>
                      </li>
                      <li className="flex justify-between text-slate-400">
                        <span>🎧 iPad Air</span>
                        <span>Active 1d ago</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#006591] dark:bg-[#0ea5e9] text-white py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* 2. EQUALIZER & SOUND FX SHEET */}
            {activeModal === 'equalizer' && (
              <motion.div
                key="modal-equalizer"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#e0f2fe] dark:border-slate-800 max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#141d21] dark:text-white">
                      Equalizer & Audio Processing
                    </h3>
                    <p className="text-xs text-[#6e7881] dark:text-slate-400">
                      Customize 5-band sound frequencies & spatial audio
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* EQ Presets */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-[#6e7881] dark:text-slate-400 uppercase tracking-wider mb-2">
                    Sound Presets
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Flat', 'Bass Boost', 'Vocal Boost', 'Electronic', 'Acoustic', 'Rock'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setEqPreset(preset)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                          eqPreset === preset
                            ? 'bg-[#006591] dark:bg-[#0ea5e9] text-white shadow-md'
                            : 'bg-[#ecf5fb] dark:bg-slate-800 text-[#3e4850] dark:text-slate-300'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Band Visual Equalizer Bars */}
                <div className="mb-6 bg-[#ecf5fb] dark:bg-slate-800/80 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-[#6e7881] dark:text-slate-400 uppercase tracking-wider mb-4">
                    5-Band Graphic Equalizer
                  </p>
                  <div className="flex justify-between items-end h-32 px-4 gap-4">
                    {[
                      { freq: '60Hz', val: eqPreset === 'Bass Boost' ? 80 : 50 },
                      { freq: '230Hz', val: eqPreset === 'Bass Boost' ? 65 : 45 },
                      { freq: '910Hz', val: eqPreset === 'Vocal Boost' ? 85 : 55 },
                      { freq: '3.6kHz', val: eqPreset === 'Acoustic' ? 75 : 60 },
                      { freq: '14kHz', val: eqPreset === 'Electronic' ? 90 : 70 },
                    ].map((band, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end gap-2">
                        <div className="w-full bg-[#e0f2fe] dark:bg-slate-700 rounded-full h-24 relative overflow-hidden flex items-end">
                          <motion.div
                            initial={false}
                            animate={{ height: `${band.val}%` }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="w-full bg-[#006591] dark:bg-[#0ea5e9] rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#6e7881] dark:text-slate-400">
                          {band.freq}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spatial Audio Enhancers */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#ecf5fb] dark:bg-slate-800 rounded-2xl">
                    <span className="text-sm font-bold text-[#141d21] dark:text-white">Bass Enhancer</span>
                    <button
                      onClick={() => setBassEnhancer(!bassEnhancer)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${
                        bassEnhancer ? 'bg-[#006591] dark:bg-[#0ea5e9]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${bassEnhancer ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#ecf5fb] dark:bg-slate-800 rounded-2xl">
                    <span className="text-sm font-bold text-[#141d21] dark:text-white">3D Surround Audio</span>
                    <button
                      onClick={() => setSurroundSound(!surroundSound)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${
                        surroundSound ? 'bg-[#006591] dark:bg-[#0ea5e9]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${surroundSound ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#006591] dark:bg-[#0ea5e9] text-white py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
                >
                  Save Equalizer Settings
                </button>
              </motion.div>
            )}

            {/* 3. STORAGE & CACHE MODAL */}
            {activeModal === 'storage' && (
              <motion.div
                key="modal-storage"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 z-[101] shadow-2xl border border-[#e0f2fe] dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">cleaning_services</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#141d21] dark:text-white">
                      Clear Cache & Media
                    </h3>
                    <p className="text-xs text-[#6e7881] dark:text-slate-400">Free up local device space</p>
                  </div>
                </div>

                <div className="space-y-3 my-4 bg-[#ecf5fb] dark:bg-slate-800 p-4 rounded-2xl text-xs">
                  <div className="flex justify-between">
                    <span>Audio Stream Cache</span>
                    <span className="font-bold">245.8 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Album Artwork Cache</span>
                    <span className="font-bold">48.2 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temporary App Logs</span>
                    <span className="font-bold">12.4 MB</span>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex justify-between font-extrabold text-sm text-[#141d21] dark:text-white">
                    <span>Total Space to Clear</span>
                    <span className="text-[#006591] dark:text-[#38bdf8]">306.4 MB</span>
                  </div>
                </div>

                {cacheCleared ? (
                  <div className="p-3 bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl text-center text-xs font-bold animate-fade-in">
                    ✓ Cache cleared successfully!
                  </div>
                ) : (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearCache}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
                    >
                      Clear 306.4 MB
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. ABOUT & BACKEND DIAGNOSTICS SHEET */}
            {activeModal === 'about' && (
              <motion.div
                key="modal-about"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#e0f2fe] dark:border-slate-800 max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#141d21] dark:text-white">
                      RAGGA Stream — About
                    </h3>
                    <p className="text-xs text-[#6e7881] dark:text-slate-400">
                      Version 2.4.0 (Build 20260804)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Backend Status Check Card */}
                  <div className="p-4 bg-[#ecf5fb] dark:bg-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-[#141d21] dark:text-white">
                        Java Spring Boot Backend
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            backendStatus === 'online'
                              ? 'bg-green-500 animate-pulse'
                              : backendStatus === 'checking'
                              ? 'bg-amber-500 animate-spin'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="font-bold capitalize text-slate-700 dark:text-slate-200">
                          {backendStatus}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <p>Endpoint: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">http://localhost:8080/api/music</code></p>
                      {latency && <p>Network Ping Latency: <strong className="text-green-600 dark:text-green-400">{latency} ms</strong></p>}
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white">License & System Information</p>
                    <p>Designed with High-Res audio playback, React Native Capacitor bridge, and Spring Boot REST API services.</p>
                    <p className="text-[11px] text-slate-400">© 2026 RAGGA Stream Inc. All rights reserved.</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#006591] dark:bg-[#0ea5e9] text-white py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* 5. LOGOUT CONFIRMATION SHEET */}
            {activeModal === 'logout' && (
              <motion.div
                key="modal-logout"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#e0f2fe] dark:border-slate-800"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="text-center space-y-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">logout</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#141d21] dark:text-white">
                    Log Out of RAGGA Stream?
                  </h3>
                  <p className="text-xs text-[#6e7881] dark:text-slate-400 max-w-sm mx-auto">
                    You will need to sign back in to access your offline playlists and personalized music recommendations.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      onNavigate('login', 'push_back');
                    }}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold shadow-md cursor-pointer active:scale-95 transition-transform"
                  >
                    Confirm Log Out
                  </button>
                </div>
              </motion.div>
            )}

          </>
        )}
      </AnimatePresence>

      {/* Persistent Navigation Bar */}
      <BottomNav currentScreen="settings" onNavigate={onNavigate} />
    </div>
  );
};
