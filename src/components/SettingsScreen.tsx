import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, TransitionType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { supabase, upsertUserProfile, signOutCleanSupabase } from '../services/supabaseClient';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useAudio();

  // User Profile State (Auto-fetched from Supabase Auth / Google OAuth metadata)
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('Raaga Listener');
  const [email, setEmail] = useState<string>('user@raaga.stream');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // UI Control States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 1. AUTO-FETCH GOOGLE OAUTH / SUPABASE USER DETAILS ON MOUNT
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          setUserId(user.id);
          setEmail(user.email || 'user@raaga.stream');

          const metadata = user.user_metadata || {};
          const name = metadata.full_name || metadata.name || user.email || 'Raaga Listener';
          const avatar = metadata.avatar_url || metadata.picture || '';

          setDisplayName(name);
          setAvatarUrl(avatar);
          setNewDisplayName(name);

          // Sync record in public.profiles table
          await upsertUserProfile(user);
        }
      } catch (err) {
        console.warn('[SettingsScreen] Auto-fetch user profile notice:', err);
      }
    };

    fetchUserProfile();

    // Real-time listener for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        setUserId(session.user.id);
        setEmail(session.user.email || 'user@raaga.stream');
        const metadata = session.user.user_metadata || {};
        const name = metadata.full_name || metadata.name || session.user.email || 'Raaga Listener';
        const avatar = metadata.avatar_url || metadata.picture || '';
        setDisplayName(name);
        setAvatarUrl(avatar);
        setNewDisplayName(name);
        await upsertUserProfile(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Back Navigation Handler
  const handleBack = useCallback(() => {
    if (isEditModalOpen) {
      setIsEditModalOpen(false);
    } else {
      onNavigate('home', 'push_back');
    }
  }, [isEditModalOpen, onNavigate]);

  // Keyboard Escape Modal Dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen]);

  // -------------------------------------------------------------
  // 2. SAVE INLINE / MODAL DISPLAY NAME TO SUPABASE & PROFILES
  // -------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    setIsSavingProfile(true);
    const updatedName = newDisplayName.trim();

    try {
      // 1. Update Supabase Auth user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: updatedName },
      });

      if (error) {
        console.error('[SettingsScreen] Supabase auth.updateUser error:', error.message);
        showToast?.('Failed to update profile. Please try again.');
      } else {
        setDisplayName(updatedName);

        // 2. Persist update directly into public.profiles table
        if (data?.user) {
          await upsertUserProfile(data.user);
        } else if (userId) {
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: updatedName,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
        }

        setIsEditModalOpen(false);
        showToast?.('Profile display name updated successfully!');
      }
    } catch (err) {
      console.error('[SettingsScreen] Profile save caught exception:', err);
      setDisplayName(updatedName);
      setIsEditModalOpen(false);
      showToast?.('Profile updated locally.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // -------------------------------------------------------------
  // 3. CLEAN LOG OUT ACTION
  // -------------------------------------------------------------
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutCleanSupabase();
      showToast?.('Signed out cleanly.');
    } catch (err) {
      console.warn('[SettingsScreen] Logout notice:', err);
    } finally {
      setIsLoggingOut(false);
      onNavigate('login', 'push_back');
    }
  };

  // Avatar Initials Fallback
  const getInitials = (name: string) => {
    if (!name) return 'R';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen pb-36 transition-colors duration-300 relative font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 py-4 border-b border-[#282828] shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] text-white hover:text-[#1DB954] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Back to Home"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] text-[#B3B3B3] font-medium">
              Profile & Preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Settings Container */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ========================================================= */}
        {/* CONTROL 1: USER PROFILE CARD (Google OAuth Auto-Fetched) */}
        {/* ========================================================= */}
        <section className="bg-[#181818] border border-[#282828] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#1DB954]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
            {/* User Avatar Image or Fallback Initials */}
            <div className="relative group flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#1DB954] shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1DB954] to-[#121212] flex items-center justify-center border-2 border-[#1DB954] shadow-lg text-white font-extrabold text-2xl tracking-wider">
                  {getInitials(displayName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-[#1DB954] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            </div>

            {/* User Info Details */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {displayName}
                </h2>
                <span className="bg-[#1DB954]/20 text-[#1DB954] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-[#1DB954]/30">
                  Google Sync
                </span>
              </div>
              <p className="text-sm text-[#B3B3B3] font-medium break-all">
                {email}
              </p>
              {userId && (
                <p className="text-[11px] text-gray-500 font-mono">
                  ID: {userId.slice(0, 20)}...
                </p>
              )}
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => {
                setNewDisplayName(displayName);
                setIsEditModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#282828] hover:bg-[#3E3E3E] text-white hover:text-[#1DB954] text-xs font-extrabold rounded-full border border-[#3E3E3E] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CONTROL 2: DYNAMIC LIGHT / DARK MODE SWITCH              */}
        {/* ========================================================= */}
        <section className="bg-[#181818] border border-[#282828] rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#B3B3B3] font-mono">
            App Appearance
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-[#121212] rounded-2xl border border-[#282828]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#282828] flex items-center justify-center text-[#1DB954]">
                <span className="material-symbols-outlined text-2xl">
                  {isDarkMode ? 'dark_mode' : 'light_mode'}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Mode Theme</p>
                <p className="text-xs text-[#B3B3B3]">
                  {isDarkMode ? 'Dark high-contrast UI enabled' : 'Light UI mode active'}
                </p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                isDarkMode ? 'bg-[#1DB954]' : 'bg-[#3E3E3E]'
              }`}
              aria-label="Toggle Theme"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CONTROL 3: CLEAN LOG OUT BUTTON                          */}
        {/* ========================================================= */}
        <section className="bg-[#181818] border border-[#282828] rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#B3B3B3] font-mono">
            Session Controls
          </h3>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 hover:text-red-300 font-extrabold text-sm transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {isLoggingOut ? 'Signing Out...' : 'Log Out of RAAGA'}
          </button>
        </section>

      </main>

      {/* ========================================================= */}
      {/* INLINE / MODAL DISPLAY NAME EDITING FLOW                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#181818] border border-[#282828] rounded-3xl p-6 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-[#282828] pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1DB954]">edit_note</span>
                  <h3 className="text-lg font-extrabold text-white">Edit Display Name</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#B3B3B3] uppercase tracking-wider font-mono">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    required
                    className="w-full h-12 bg-[#121212] border border-[#282828] focus:border-[#1DB954] rounded-2xl px-4 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#B3B3B3] uppercase tracking-wider font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-12 bg-[#282828]/50 border border-[#282828] rounded-2xl px-4 text-sm text-gray-400 outline-none cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-500">
                    Email address is synced with your Google OAuth / Supabase account.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 bg-[#282828] hover:bg-[#3E3E3E] text-white text-xs font-extrabold rounded-2xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile || !newDisplayName.trim()}
                    className="flex-1 py-3 bg-[#1DB954] hover:bg-[#1ED760] text-black text-xs font-extrabold rounded-2xl transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
