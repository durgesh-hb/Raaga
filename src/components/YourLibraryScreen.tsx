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
    <div className="bg-[#121212] text-white min-h-screen pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 w-full bg-[#121212]/90 backdrop-blur-xl z-40 flex justify-between items-center px-4 md:px-10 h-16 border-b border-[#282828] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center overflow-hidden border border-[#282828]">
            <img
              className="w-full h-full object-cover"
              alt="User Avatar"
              src={USER_PROFILE.avatarUrl}
            />
          </div>
          <h1 className="text-xl font-extrabold text-white">
            Your Library
          </h1>
        </div>
        <button
          onClick={() => onNavigate('settings', 'push')}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
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
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
            }`}
          >
            Playlists ({customPlaylists.length})
          </button>
          <button
            onClick={() => setActiveFilter('liked')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'liked'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
            }`}
          >
            Liked Songs ({likedTracks.length})
          </button>
          <button
            onClick={() => setActiveFilter('artists')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'artists'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
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
            className="relative overflow-hidden h-48 rounded-[28px] bg-gradient-to-br from-[#1DB954] via-[#121212] to-[#181818] p-6 text-white shadow-xl border border-[#282828] group cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500 text-[#1DB954]">
              <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <span className="material-symbols-outlined text-4xl mb-2 text-[#1DB954]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Liked Songs</h2>
                <p className="text-sm opacity-90 font-medium text-[#B3B3B3]">
                  {likedTracks.length > 0 ? `${likedTracks.length} saved tracks` : 'Tap to play dynamic hits'}
                </p>
              </div>
              <span className="text-xs uppercase font-bold tracking-widest bg-black/40 text-[#1DB954] px-3 py-1 rounded-full w-max backdrop-blur-md border border-[#1DB954]/30">
                DYNAMIC PLAYLIST
              </span>
            </div>
          </div>

          {/* New Playlist Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="h-48 rounded-[28px] border-2 border-dashed border-[#282828] flex flex-col items-center justify-center gap-3 text-[#1DB954] bg-[#181818] hover:bg-[#282828] hover:border-[#1DB954]/50 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-[#282828] text-[#1DB954] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <span className="text-base font-bold text-white group-hover:text-[#1DB954]">Create Dynamic Playlist</span>
          </div>
        </div>

        {/* Dynamic Activity List */}
        <section className="space-y-4 mb-32">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {activeFilter === 'liked' ? 'Your Dynamic Liked Songs' : 'Dynamic Playlists'}
            </h3>
            {isLoadingPlaylist && (
              <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
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
                  className="flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] active:bg-[#282828] transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" alt={track.title} src={track.coverUrl} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-base font-bold text-white truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-[#B3B3B3] truncate font-medium">
                      {track.artist}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#1DB954]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-[#1DB954] mb-2">favorite_border</span>
                <p className="text-sm font-semibold text-white">No saved songs yet</p>
                <button
                  onClick={() => handleSelectPlaylist('Bollywood Top 50')}
                  className="mt-3 px-5 py-2.5 bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-full text-xs font-bold shadow-md cursor-pointer hover:scale-105"
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
                className="flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] active:bg-[#282828] transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#282828] flex items-center justify-center text-[#1DB954] flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">queue_music</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-base font-bold text-white truncate">
                    {plName}
                  </h4>
                  <p className="text-xs text-[#B3B3B3] font-medium">
                    Dynamic Playlist • Tap to load live tracks
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#B3B3B3] group-hover:text-[#1DB954]">
                  play_circle
                </span>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modal for Creating Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylist}
            className="bg-[#282828] p-6 rounded-3xl w-full max-w-md shadow-2xl border border-[#3E3E3E]"
          >
            <h3 className="text-xl font-bold mb-2 text-white">
              Create Dynamic Playlist
            </h3>
            <p className="text-xs text-[#B3B3B3] mb-4">
              Enter a search query or playlist title (e.g. Arijit Singh Hits, Punjabi 2026).
            </p>
            <input
              type="text"
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-[#181818] border border-[#3E3E3E] outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] text-base mb-6 text-white placeholder-[#B3B3B3]"
              placeholder="e.g. Arijit Singh Hits"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#B3B3B3] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#1DB954] hover:bg-[#1ED760] text-black shadow-md cursor-pointer"
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
          className="bg-[#282828] shadow-2xl rounded-2xl p-3 flex items-center gap-3 border border-[#3E3E3E] cursor-pointer relative"
        >
          <div className="w-12 h-12 rounded-xl bg-[#181818] overflow-hidden flex-shrink-0 relative">
            <img
              className="w-full h-full object-cover"
              alt={currentTrack.title}
              src={currentTrack.coverUrl}
            />
            {isBuffering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#1DB954] text-xs animate-spin">
                  progress_activity
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-[#B3B3B3] truncate font-semibold">
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-full cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
          <div className="absolute bottom-0 left-3 right-3 h-1 bg-[#535353] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1DB954] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <BottomNav currentScreen="library" onNavigate={onNavigate} />
    </div>
  );
};
