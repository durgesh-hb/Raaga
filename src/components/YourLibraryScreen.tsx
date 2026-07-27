import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, Track } from '../types';
import { BottomNav } from './Navigation';
import { USER_PROFILE } from '../data';
import { useAudio } from '../context/AudioContext';
import { MusicApiService } from '../services/musicApiService';

interface YourLibraryScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const YourLibraryScreen: React.FC<YourLibraryScreenProps> = ({ onNavigate }) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    position,
    duration,
    playTrack,
    togglePlay,
    favorites,
    queue,
    loadDynamicQueue,
  } = useAudio();

  const [activeFilter, setActiveFilter] = useState<'playlists' | 'artists' | 'liked'>('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [customPlaylists, setCustomPlaylists] = useState<string[]>([
    'Bollywood Top 50',
    'Arijit Singh Melodies',
    'A.R. Rahman Magic',
    'Punjabi Party Hits',
  ]);

  const [activePlaylistTracks, setActivePlaylistTracks] = useState<Track[]>(queue);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string>('Bollywood Top 50');
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState<boolean>(false);

  // Combine queue & favorites for dynamic liked tracks catalog
  const likedTracks = queue.filter((t) => t.isFavorite || favorites.includes(t.id));

  // Dynamically load playlist tracks on mount or playlist change
  const handleSelectPlaylist = async (plName: string) => {
    setSelectedPlaylistName(plName);
    setIsLoadingPlaylist(true);
    try {
      const fetched = await MusicApiService.searchSongs(plName);
      if (fetched && fetched.length > 0) {
        setActivePlaylistTracks(fetched);
        playTrack(fetched[0], fetched);
        onNavigate('player', 'slide_up');
      }
    } catch (err) {
      console.warn('[YourLibraryScreen] Failed to load dynamic playlist:', err);
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (activePlaylistTracks.length === 0) {
      setIsLoadingPlaylist(true);
      MusicApiService.searchSongs('Bollywood Top 50')
        .then((res) => {
          if (isMounted && res && res.length > 0) {
            setActivePlaylistTracks(res);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingPlaylist(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistTitle.trim()) {
      const title = newPlaylistTitle.trim();
      setCustomPlaylists((prev) => [title, ...prev]);
      setNewPlaylistTitle('');
      setShowCreateModal(false);
      handleSelectPlaylist(title);
    }
  };

  const totalDuration = duration || currentTrack.duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (position / totalDuration) * 100));

  return (
    <div className="bg-[#f4faff] dark:bg-[#0b1319] text-[#141d21] dark:text-[#e2e8f0] min-h-screen pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 w-full bg-white/80 dark:bg-[#0b1319]/80 backdrop-blur-xl z-40 flex justify-between items-center px-4 md:px-10 h-16 shadow-[0_8px_32px_rgba(14,165,233,0.08)] border-b border-[#e0f2fe] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c0e8ff] flex items-center justify-center overflow-hidden border-2 border-white sky-shadow">
            <img
              className="w-full h-full object-cover"
              alt="User Avatar"
              src={USER_PROFILE.avatarUrl}
            />
          </div>
          <h1 className="text-xl font-extrabold text-[#006591] dark:text-[#38bdf8]">
            Your Library
          </h1>
        </div>
        <button
          onClick={() => onNavigate('settings', 'push')}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#3e4850] dark:text-slate-300 hover:bg-[#0ea5e9]/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="px-4 md:px-10 max-w-7xl mx-auto pt-6">
        {/* Filter Chips */}
        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
          <button
            onClick={() => setActiveFilter('playlists')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'playlists'
                ? 'bg-[#006591] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-[#3e4850] dark:text-slate-300 hover:bg-[#e6eff5]'
            }`}
          >
            Playlists ({customPlaylists.length})
          </button>
          <button
            onClick={() => setActiveFilter('liked')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'liked'
                ? 'bg-[#006591] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-[#3e4850] dark:text-slate-300 hover:bg-[#e6eff5]'
            }`}
          >
            Liked Songs ({likedTracks.length})
          </button>
          <button
            onClick={() => setActiveFilter('artists')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'artists'
                ? 'bg-[#006591] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-[#3e4850] dark:text-slate-300 hover:bg-[#e6eff5]'
            }`}
          >
            Artists
          </button>
        </nav>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Liked Songs Hero Card */}
          <div
            onClick={() => {
              if (likedTracks.length > 0) {
                playTrack(likedTracks[0], likedTracks);
                onNavigate('player', 'slide_up');
              } else {
                loadDynamicQueue('Arijit Singh Hits');
                onNavigate('player', 'slide_up');
              }
            }}
            className="relative overflow-hidden h-48 rounded-[28px] bg-gradient-to-br from-[#006591] via-[#0ea5e9] to-[#006686] p-6 text-white sky-shadow group cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold">Liked Songs</h2>
                <p className="text-sm opacity-90 font-medium">
                  {likedTracks.length > 0 ? `${likedTracks.length} saved tracks` : 'Tap to play dynamic hits'}
                </p>
              </div>
              <span className="text-xs uppercase font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full w-max backdrop-blur-md">
                DYNAMIC PLAYLIST
              </span>
            </div>
          </div>

          {/* New Playlist Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="h-48 rounded-[28px] border-2 border-dashed border-[#006591]/30 flex flex-col items-center justify-center gap-3 text-[#006591] dark:text-[#38bdf8] bg-white/50 dark:bg-slate-900/50 hover:bg-[#006591]/10 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center sky-shadow group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <span className="text-base font-bold">Create Dynamic Playlist</span>
          </div>
        </div>

        {/* Dynamic Activity List */}
        <section className="space-y-4 mb-32">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#141d21] dark:text-white">
              {activeFilter === 'liked' ? 'Your Dynamic Liked Songs' : 'Dynamic Playlists'}
            </h3>
            {isLoadingPlaylist && (
              <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8] animate-spin text-sm">
                progress_activity
              </span>
            )}
          </div>

          {activeFilter === 'liked' ? (
            likedTracks.length > 0 ? (
              likedTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(track, likedTracks);
                    onNavigate('player', 'slide_up');
                  }}
                  className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl sky-shadow hover:bg-[#ecf5fb] dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" alt={track.title} src={track.coverUrl} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-base font-bold text-[#141d21] dark:text-white truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-[#006591] dark:text-[#38bdf8] truncate font-medium">
                      {track.artist}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#006591]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-[#006591] mb-2">favorite_border</span>
                <p className="text-sm font-semibold text-[#141d21] dark:text-white">No saved songs yet</p>
                <button
                  onClick={() => handleSelectPlaylist('Bollywood Top 50')}
                  className="mt-3 px-4 py-2 bg-[#006591] text-white rounded-full text-xs font-bold shadow-md cursor-pointer hover:scale-105"
                >
                  Load Dynamic Bollywood Songs
                </button>
              </div>
            )
          ) : (
            customPlaylists.map((plName, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPlaylist(plName)}
                className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl sky-shadow hover:bg-[#ecf5fb] dark:hover:bg-slate-800 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#006591] to-[#0ea5e9] flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">queue_music</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-base font-bold text-[#141d21] dark:text-white truncate">
                    {plName}
                  </h4>
                  <p className="text-xs text-[#3e4850] dark:text-slate-400 font-medium">
                    Dynamic Playlist • Tap to load live tracks from API
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#3e4850] dark:text-slate-400 group-hover:text-[#006591]">
                  play_circle
                </span>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modal for Creating Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylist}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-md shadow-2xl border border-white/40"
          >
            <h3 className="text-xl font-bold mb-2 text-[#141d21] dark:text-white">
              Create Dynamic Playlist
            </h3>
            <p className="text-xs text-[#3e4850] dark:text-slate-400 mb-4">
              Enter a search query or playlist title (e.g. Arijit Singh Hits, Punjabi 2026).
            </p>
            <input
              type="text"
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-[#ecf5fb] dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-[#006591] text-base mb-6 text-[#141d21] dark:text-white"
              placeholder="e.g. Arijit Singh Hits"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#3e4850] dark:text-slate-300 hover:bg-[#e0e9ef] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#006591] text-white hover:bg-[#004c6e] shadow-md cursor-pointer"
              >
                Create & Fetch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mini Player */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6 left-4 right-4 z-40 max-w-xl mx-auto">
        <div
          onClick={() => onNavigate('player', 'slide_up')}
          className="glass-card-elevated sky-shadow rounded-2xl p-3 flex items-center gap-3 border border-white/50 dark:border-slate-800 cursor-pointer relative"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0ea5e9] overflow-hidden flex-shrink-0 relative">
            <img
              className="w-full h-full object-cover"
              alt={currentTrack.title}
              src={currentTrack.coverUrl}
            />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs animate-spin">
                  progress_activity
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-bold text-[#141d21] dark:text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-[#006591] dark:text-[#38bdf8] truncate font-semibold">
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center text-[#006591] dark:text-[#38bdf8] cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
          <div className="absolute bottom-0 left-3 right-3 h-1 bg-[#dbe4ea] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0ea5e9] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <BottomNav currentScreen="library" onNavigate={onNavigate} />
    </div>
  );
};
