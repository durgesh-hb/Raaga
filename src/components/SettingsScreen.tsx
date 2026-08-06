import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, TransitionType } from '../types';
import { BottomNav } from './Navigation';
import { USER_PROFILE } from '../data';
import { useAudio } from '../context/AudioContext';
import { MusicApiService } from '../services/musicApiService';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

type ModalType = 'account' | 'equalizer' | 'storage' | 'about' | 'logout' | null;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
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
    <div className="bg-[#121212] text-white min-h-screen pb-36 transition-colors duration-300 relative">
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 py-3.5 shadow-md border-b border-[#282828]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] text-white hover:text-[#1DB954] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] text-[#B3B3B3] font-medium">
              Preferences & Audio Engine
            </p>
          </div>
        </div>

        {/* Quick Modal Indicator Badge */}
        {activeModal && (
          <span className="text-xs font-bold text-[#1DB954] bg-[#1DB954]/15 px-3 py-1 rounded-full animate-pulse">
            Sub-Menu Open
          </span>
        )}
      </header>

      {/* Main Settings Container */}
      <main className="max-w-[800px] mx-auto px-4 md:px-6 mt-6 space-y-6">
        
        {/* ACCOUNT SECTION */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#B3B3B3] font-extrabold ml-2">
            Account & Subscription
          </h2>
          <div
            onClick={() => setActiveModal('account')}
            className="bg-[#181818] rounded-[28px] p-5 shadow-lg border border-[#282828] hover:border-[#1DB954]/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1DB954] shadow-md group-hover:scale-105 transition-transform">
                  <img
                    className="w-full h-full object-cover"
                    alt={USER_PROFILE.name}
                    src={USER_PROFILE.avatarUrl}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-[#1DB954] transition-colors">
                    {USER_PROFILE.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="material-symbols-outlined text-[#1DB954] text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span className="text-xs font-bold text-[#1DB954]">
                      Premium Member
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#1DB954] font-bold text-sm">
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
          <h2 className="text-xs uppercase tracking-widest text-[#B3B3B3] font-extrabold ml-2">
            Playback & Sound Engine
          </h2>
          <div className="bg-[#181818] rounded-[28px] overflow-hidden shadow-lg border border-[#282828] divide-y divide-[#282828]">
            
            {/* Master Volume Slider */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#1DB954]">
                    {volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                  </span>
                  <div>
                    <p className="text-base font-bold text-white">
                      Player Volume
                    </p>
                    <p className="text-xs text-[#B3B3B3]">
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
                className="w-full h-2 bg-[#535353] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
            </div>

            {/* Audio Quality Selector */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-base font-bold text-white">
                    Streaming Quality
                  </p>
                  <p className="text-xs text-[#B3B3B3]">
                    Very High (320 kbps AAC/FLAC)
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#1DB954] bg-[#1DB954]/15 px-3 py-1 rounded-full">
                  Very High FLAC
                </span>
              </div>
              <div className="flex gap-2">
                {(['lossless', 'high', 'saver'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAudioQuality(mode)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                      audioQuality === mode
                        ? 'bg-[#1DB954] text-black shadow-md'
                        : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
                    }`}
                  >
                    {mode === 'lossless'
                      ? 'Very High (FLAC)'
                      : mode === 'high'
                      ? 'High (320kbps)'
                      : 'Data Saver'}
                  </button>
                ))}
              </div>
            </div>

            {/* Equalizer & Sound Effects Trigger */}
            <div
              onClick={() => setActiveModal('equalizer')}
              className="p-5 flex items-center justify-between hover:bg-[#282828] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center text-[#1DB954]">
                  <span className="material-symbols-outlined">equalizer</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white group-hover:text-[#1DB954] transition-colors">
                    Equalizer & Sound FX
                  </p>
                  <p className="text-xs text-[#B3B3B3]">
                    Preset: <span className="font-semibold text-[#1DB954]">{eqPreset}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#1DB954]">
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Crossfade & Gapless */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#B3B3B3]">
                    slow_motion_video
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Crossfade Overlap
                    </p>
                    <p className="text-xs text-[#B3B3B3]">
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
                  className="w-28 h-1.5 bg-[#535353] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#B3B3B3]">
                    skip_next
                  </span>
                  <p className="text-sm font-bold text-white">
                    Gapless Playback
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gapless}
                  onClick={() => setGapless(!gapless)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer p-0.5 ${
                    gapless ? 'bg-[#1DB954]' : 'bg-[#535353]'
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
          <h2 className="text-xs uppercase tracking-widest text-[#B3B3B3] font-extrabold ml-2">
            Storage & Data Management
          </h2>
          <div
            onClick={() => setActiveModal('storage')}
            className="bg-[#181818] rounded-[28px] p-5 shadow-lg border border-[#282828] hover:border-[#1DB954]/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center text-[#1DB954]">
                  <span className="material-symbols-outlined">sd_card</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white group-hover:text-[#1DB954] transition-colors">
                    Storage & Cache Usage
                  </p>
                  <p className="text-xs text-[#B3B3B3]">
                    306.4 MB stored (Audio & Artwork)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#1DB954]">
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT & BACKEND DIAGNOSTICS SECTION */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#B3B3B3] font-extrabold ml-2">
            System & About
          </h2>
          <div
            onClick={() => setActiveModal('about')}
            className="bg-[#181818] rounded-[28px] p-5 shadow-lg border border-[#282828] hover:border-[#1DB954]/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center text-[#1DB954]">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white group-hover:text-[#1DB954] transition-colors">
                    About & Backend Status
                  </p>
                  <p className="text-xs text-[#B3B3B3]">
                    Version v2.4.0 • Spring Boot Server Info
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#1DB954]">
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
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 p-4 rounded-[24px] border border-red-500/20 font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 shadow-sm"
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
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />

            {/* 1. ACCOUNT & SUBSCRIPTION SHEET */}
            {activeModal === 'account' && (
              <motion.div
                key="modal-account"
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#282828] rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#3E3E3E] max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-[#535353] rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1DB954] shadow-lg">
                      <img className="w-full h-full object-cover" alt="User" src={USER_PROFILE.avatarUrl} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        {USER_PROFILE.name}
                      </h3>
                      <p className="text-xs text-[#B3B3B3]">nithin@ragga.stream</p>
                      <span className="inline-block mt-1 px-3 py-0.5 bg-[#1DB954]/15 text-[#1DB954] text-[11px] font-extrabold rounded-full">
                        Premium Family Plan
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#B3B3B3] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="space-y-4 text-sm text-[#B3B3B3]">
                  <div className="p-4 bg-[#181818] rounded-2xl flex justify-between items-center border border-[#282828]">
                    <div>
                      <p className="font-bold text-white">Auto-Renewal Date</p>
                      <p className="text-xs text-[#B3B3B3]">Renews on August 28, 2026</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#1DB954] bg-[#1DB954]/15 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="p-4 bg-[#181818] rounded-2xl border border-[#282828]">
                    <p className="font-bold text-white mb-2">Connected Devices (3/5)</p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex justify-between">
                        <span>📱 iPhone 15 Pro (This Device)</span>
                        <span className="text-[#1DB954] font-bold">Online</span>
                      </li>
                      <li className="flex justify-between text-[#B3B3B3]">
                        <span>💻 MacBook Pro M3</span>
                        <span>Active 2h ago</span>
                      </li>
                      <li className="flex justify-between text-[#B3B3B3]">
                        <span>🎧 iPad Air</span>
                        <span>Active 1d ago</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#1DB954] hover:bg-[#1ED760] text-black py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
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
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#282828] rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#3E3E3E] max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-[#535353] rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      Equalizer & Audio Processing
                    </h3>
                    <p className="text-xs text-[#B3B3B3]">
                      Customize 5-band sound frequencies & spatial audio
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#B3B3B3] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* EQ Presets */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider mb-2">
                    Sound Presets
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Flat', 'Bass Boost', 'Vocal Boost', 'Electronic', 'Acoustic', 'Rock'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setEqPreset(preset)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                          eqPreset === preset
                            ? 'bg-[#1DB954] text-black shadow-md'
                            : 'bg-[#181818] text-[#B3B3B3] hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Band Visual Equalizer Bars */}
                <div className="mb-6 bg-[#181818] p-5 rounded-2xl border border-[#282828]">
                  <p className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider mb-4">
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
                        <div className="w-full bg-[#535353] rounded-full h-24 relative overflow-hidden flex items-end">
                          <motion.div
                            initial={false}
                            animate={{ height: `${band.val}%` }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="w-full bg-[#1DB954] rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#B3B3B3]">
                          {band.freq}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spatial Audio Enhancers */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#181818] rounded-2xl border border-[#282828]">
                    <span className="text-sm font-bold text-white">Bass Enhancer</span>
                    <button
                      onClick={() => setBassEnhancer(!bassEnhancer)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${
                        bassEnhancer ? 'bg-[#1DB954]' : 'bg-[#535353]'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${bassEnhancer ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#181818] rounded-2xl border border-[#282828]">
                    <span className="text-sm font-bold text-white">3D Surround Audio</span>
                    <button
                      onClick={() => setSurroundSound(!surroundSound)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${
                        surroundSound ? 'bg-[#1DB954]' : 'bg-[#535353]'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${surroundSound ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#1DB954] hover:bg-[#1ED760] text-black py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
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
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#282828] rounded-[32px] p-6 z-[101] shadow-2xl border border-[#3E3E3E]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">cleaning_services</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Clear Cache & Media
                    </h3>
                    <p className="text-xs text-[#B3B3B3]">Free up local device space</p>
                  </div>
                </div>

                <div className="space-y-3 my-4 bg-[#181818] p-4 rounded-2xl text-xs text-[#B3B3B3] border border-[#282828]">
                  <div className="flex justify-between">
                    <span>Audio Stream Cache</span>
                    <span className="font-bold text-white">245.8 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Album Artwork Cache</span>
                    <span className="font-bold text-white">48.2 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temporary App Logs</span>
                    <span className="font-bold text-white">12.4 MB</span>
                  </div>
                  <hr className="border-[#282828]" />
                  <div className="flex justify-between font-extrabold text-sm text-white">
                    <span>Total Space to Clear</span>
                    <span className="text-[#1DB954]">306.4 MB</span>
                  </div>
                </div>

                {cacheCleared ? (
                  <div className="p-3 bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] rounded-xl text-center text-xs font-bold animate-fade-in">
                    ✓ Cache cleared successfully!
                  </div>
                ) : (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-3 bg-[#181818] text-white rounded-xl font-bold hover:bg-[#3E3E3E] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearCache}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
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
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#282828] rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#3E3E3E] max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-[#535353] rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      RAAGA Stream — Dark Theme
                    </h3>
                    <p className="text-xs text-[#B3B3B3]">
                      Version 2.4.0 (Build 20260804)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#B3B3B3] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Backend Status Check Card */}
                  <div className="p-4 bg-[#181818] rounded-2xl space-y-2 border border-[#282828]">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">
                        Java Spring Boot Backend
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            backendStatus === 'online'
                              ? 'bg-[#1DB954] animate-pulse'
                              : backendStatus === 'checking'
                              ? 'bg-amber-500 animate-spin'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="font-bold capitalize text-white">
                          {backendStatus}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#B3B3B3] space-y-1">
                      <p>Endpoint: <code className="bg-[#282828] text-[#1DB954] px-1 py-0.5 rounded">http://localhost:8080/api/music</code></p>
                      {latency && <p>Network Ping Latency: <strong className="text-[#1DB954]">{latency} ms</strong></p>}
                    </div>
                  </div>

                  <div className="p-4 border border-[#282828] rounded-2xl space-y-2 text-[#B3B3B3]">
                    <p className="font-bold text-white">License & System Information</p>
                    <p>Designed with Modern Dark Mode UI (#1DB954, #121212, #181818, #282828).</p>
                    <p className="text-[11px] text-[#B3B3B3]">© 2026 RAAGA Stream Inc. All rights reserved.</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-6 bg-[#1DB954] hover:bg-[#1ED760] text-black py-3.5 rounded-2xl font-extrabold shadow-md hover:scale-[1.01] active:scale-95 transition-transform"
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
                className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#282828] rounded-t-[36px] p-6 md:p-8 z-[101] shadow-2xl border-t border-[#3E3E3E]"
              >
                <div className="w-12 h-1.5 bg-[#535353] rounded-full mx-auto mb-6" />

                <div className="text-center space-y-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">logout</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Log Out of RAAGA Stream?
                  </h3>
                  <p className="text-xs text-[#B3B3B3] max-w-sm mx-auto">
                    You will need to sign back in to access your offline playlists and personalized music recommendations.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3.5 bg-[#181818] text-white rounded-2xl font-bold hover:bg-[#3E3E3E] cursor-pointer"
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
