import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, TransitionType, Track, Playlist } from '../types';
import { BottomNav } from './Navigation';
import { useAudio } from '../context/AudioContext';
import { MusicApiService } from '../services/musicApiService';
import { SongActionMenuModal } from './SongActionMenuModal';
import {
  createPlaylist,
  fetchUserPlaylists,
  fetchPlaylistTracks,
  deletePlaylist,
  removeSongFromPlaylist,
} from '../services/supabaseClient';

interface YourLibraryScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const YourLibraryScreen: React.FC<YourLibraryScreenProps> = ({ onNavigate }) => {
  const {
    playTrack,
    favorites,
    queue,
    showToast,
    loadDynamicQueue,
    toggleFavorite,
  } = useAudio();

  // Active View Filter ('playlists' | 'liked')
  const [activeFilter, setActiveFilter] = useState<'playlists' | 'liked'>('playlists');

  // Supabase Database Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);

  // Selected Playlist Detail View State
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(false);

  // Create Playlist Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Delete Entire Playlist Confirmation Modal State
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [isDeletingPlaylist, setIsDeletingPlaylist] = useState<boolean>(false);

  // Song Action Menu Modal State
  const [activeSongForMenu, setActiveSongForMenu] = useState<Track | null>(null);

  // Combine queue & favorites for Liked Songs
  const likedTracks = queue.filter((t) => t.isFavorite || favorites.includes(t.id));

  // -------------------------------------------------------------
  // 1. FETCH PLAYLISTS FROM SUPABASE ON MOUNT / LOGIN SESSION
  // -------------------------------------------------------------
  const loadPlaylists = useCallback(async () => {
    setIsLoadingPlaylists(true);
    try {
      const data = await fetchUserPlaylists();
      if (data && data.length > 0) {
        setPlaylists(data);
      } else {
        // Default initial playlists fallback if empty
        setPlaylists([
          { id: 'pl_default_1', title: 'Bollywood Top 50', description: 'Top Hindi Chartbusters' },
          { id: 'pl_default_2', title: 'Arijit Singh Melodies', description: 'Soulful acoustic & romantic hits' },
          { id: 'pl_default_3', title: 'Gym & Workout Hits', description: 'High energy pump up tracks' },
        ]);
      }
    } catch (err) {
      console.warn('[YourLibraryScreen] Supabase playlist fetch notice:', err);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // -------------------------------------------------------------
  // 2. CREATE CUSTOM PLAYLIST (SUPABASE persistent insert)
  // -------------------------------------------------------------
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    setIsCreating(true);
    const title = newPlaylistTitle.trim();
    const desc = newPlaylistDesc.trim();

    try {
      // Async Supabase DB insertion
      const newPlaylist = await createPlaylist(title, desc);

      if (newPlaylist) {
        // Update local frontend state dynamically
        setPlaylists((prev) => [newPlaylist, ...prev]);
        setNewPlaylistTitle('');
        setNewPlaylistDesc('');
        setShowCreateModal(false);
        showToast(`Created playlist "${title}"!`);

        // Navigate into newly created playlist
        openPlaylistDetails(newPlaylist);
      }
    } catch (err: any) {
      console.error('[YourLibraryScreen] Create playlist error:', err);
      showToast('Failed to create playlist. Try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // -------------------------------------------------------------
  // 3. FETCH SONGS FOR SELECTED PLAYLIST
  // -------------------------------------------------------------
  const openPlaylistDetails = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsLoadingTracks(true);
    setPlaylistTracks([]);

    try {
      // Fetch tracks linked to playlist_id from Supabase
      const savedTracks = await fetchPlaylistTracks(playlist.id);

      if (savedTracks && savedTracks.length > 0) {
        setPlaylistTracks(savedTracks);
      } else {
        // Search dynamic fallback songs based on playlist title
        const searched = await MusicApiService.searchSongs(playlist.title);
        setPlaylistTracks(searched || []);
      }
    } catch (err) {
      console.warn('[YourLibraryScreen] Playlist tracks fetch notice:', err);
      setPlaylistTracks([]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // -------------------------------------------------------------
  // 4. REMOVE SINGLE SONG FROM PLAYLIST
  // -------------------------------------------------------------
  const handleRemoveTrackFromPlaylist = async (trackId: string, trackTitle: string) => {
    if (!selectedPlaylist) return;

    try {
      // Delete entry from Supabase playlist_tracks matching playlist_id and track_id
      await removeSongFromPlaylist(selectedPlaylist.id, trackId);

      // Instantly update local frontend UI state
      setPlaylistTracks((prev) => prev.filter((t) => t.id !== trackId));
      showToast(`Removed "${trackTitle}" from playlist.`);
    } catch (err: any) {
      console.error('[YourLibraryScreen] Remove track error:', err);
      // Local state fallback update
      setPlaylistTracks((prev) => prev.filter((t) => t.id !== trackId));
      showToast(`Removed "${trackTitle}" from playlist.`);
    }
  };

  // -------------------------------------------------------------
  // 5. DELETE ENTIRE PLAYLIST WITH CONFIRMATION POPUP
  // -------------------------------------------------------------
  const handleConfirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    setIsDeletingPlaylist(true);
    const targetId = playlistToDelete.id;
    const targetTitle = playlistToDelete.title;

    try {
      // Execute deletion from Supabase DB
      await deletePlaylist(targetId);

      // Update local state, clear selected playlist & navigate back to Library root
      setPlaylists((prev) => prev.filter((pl) => pl.id !== targetId));
      if (selectedPlaylist?.id === targetId) {
        setSelectedPlaylist(null);
      }
      setPlaylistToDelete(null);
      showToast(`Deleted playlist "${targetTitle}".`);
    } catch (err: any) {
      console.error('[YourLibraryScreen] Delete playlist error:', err);
      // Local fallback state update
      setPlaylists((prev) => prev.filter((pl) => pl.id !== targetId));
      if (selectedPlaylist?.id === targetId) {
        setSelectedPlaylist(null);
      }
      setPlaylistToDelete(null);
      showToast(`Deleted playlist "${targetTitle}".`);
    } finally {
      setIsDeletingPlaylist(false);
    }
  };


  return (
    <div className="bg-[#121212] text-white min-h-screen pb-40 transition-colors duration-300 font-sans">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 w-full bg-[#121212]/90 backdrop-blur-xl z-40 flex justify-between items-center px-4 md:px-10 h-16 border-b border-[#282828] shadow-md">
        <div className="flex items-center gap-3">
          {selectedPlaylist ? (
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center text-white hover:text-[#1DB954] transition-colors cursor-pointer"
              aria-label="Back to Library Overview"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1DB954] text-black font-extrabold flex items-center justify-center text-sm shadow-md">
              <span className="material-symbols-outlined text-black font-bold">library_music</span>
            </div>
          )}
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {selectedPlaylist ? selectedPlaylist.title : 'Your Library'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!selectedPlaylist && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3E3E3E] text-[#1DB954] transition-colors cursor-pointer shadow-sm"
              title="Create New Playlist"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('settings', 'push')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <main className="px-4 md:px-10 max-w-7xl mx-auto pt-6">

        {/* ========================================================= */}
        {/* VIEW A: PLAYLIST DETAIL SCREEN (Selected Playlist)       */}
        {/* ========================================================= */}
        {selectedPlaylist ? (
          <div className="space-y-6">
            {/* Playlist Header Banner */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-b from-[#282828] to-[#181818] border border-[#282828] relative overflow-hidden">
              <div className="w-36 h-36 rounded-2xl bg-[#121212] overflow-hidden shadow-2xl flex-shrink-0 border border-[#3E3E3E] flex items-center justify-center text-[#1DB954]">
                {selectedPlaylist.cover_url ? (
                  <img src={selectedPlaylist.cover_url} alt={selectedPlaylist.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-6xl">queue_music</span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <span className="text-xs uppercase font-extrabold text-[#1DB954] tracking-widest font-mono">
                  CUSTOM PLAYLIST
                </span>
                <h2 className="text-3xl font-extrabold text-white">{selectedPlaylist.title}</h2>
                {selectedPlaylist.description && (
                  <p className="text-sm text-[#B3B3B3]">{selectedPlaylist.description}</p>
                )}

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-3 flex-wrap">
                  {playlistTracks.length > 0 && (
                    <button
                      onClick={() => {
                        playTrack(playlistTracks[0], playlistTracks);
                        onNavigate('player', 'slide_up');
                      }}
                      className="px-6 py-3 bg-[#1DB954] hover:bg-[#1ED760] text-black font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                      Play All ({playlistTracks.length})
                    </button>
                  )}

                  {/* Delete Entire Playlist Button */}
                  <button
                    onClick={() => setPlaylistToDelete(selectedPlaylist)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete Playlist
                  </button>
                </div>
              </div>
            </div>

            {/* Tracks List inside Playlist Detail */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-white">Tracks in Playlist</h3>
                <span className="text-xs text-[#B3B3B3] font-mono">{playlistTracks.length} Songs</span>
              </div>

              {isLoadingTracks ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-[#181818] rounded-2xl animate-pulse border border-[#282828]" />
                  ))}
                </div>
              ) : playlistTracks.length > 0 ? (
                playlistTracks.map((track, idx) => (
                  <div
                    key={track.id || idx}
                    onClick={() => {
                      playTrack(track, playlistTracks);
                      onNavigate('player', 'slide_up');
                    }}
                    className="flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] transition-all cursor-pointer group"
                  >
                    <span className="w-6 text-center text-xs font-mono text-[#B3B3B3]">{idx + 1}</span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#282828]">
                      <img className="w-full h-full object-cover" alt={track.title} src={track.coverUrl} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                      <p className="text-xs text-[#B3B3B3] truncate">{track.artist}</p>
                    </div>

                    {/* Action Menu (...) Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSongForMenu(track);
                      }}
                      className="w-9 h-9 rounded-full hover:bg-[#3E3E3E] flex items-center justify-center text-[#B3B3B3] hover:text-white"
                      title="Song Options"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>

                    {/* Delete Track Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrackFromPlaylist(track.id, track.title);
                      }}
                      className="w-9 h-9 rounded-full hover:bg-red-500/20 flex items-center justify-center text-[#B3B3B3] hover:text-red-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <span className="material-symbols-outlined text-lg">remove_circle_outline</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center space-y-3 bg-[#181818] rounded-3xl border border-[#282828] p-8">
                  <div className="w-16 h-16 rounded-full bg-[#282828] text-[#1DB954] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">music_off</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Playlist is empty</h4>
                  <p className="text-xs text-[#B3B3B3] max-w-sm mx-auto">
                    Add tracks to this playlist using the "..." action menu on any song item across Search or Home.
                  </p>
                  <button
                    onClick={() => onNavigate('search', 'push')}
                    className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ED760] text-black font-extrabold text-xs rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    Search & Add Songs
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW B: MAIN LIBRARY OVERVIEW                             */
          /* ========================================================= */
          <div>
            {/* Filter Tabs */}
            <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
              <button
                onClick={() => setActiveFilter('playlists')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeFilter === 'playlists' ? 'bg-[#1DB954] text-black shadow-md' : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
                }`}
              >
                Custom Playlists ({playlists.length})
              </button>
              <button
                onClick={() => setActiveFilter('liked')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeFilter === 'liked' ? 'bg-[#1DB954] text-black shadow-md' : 'bg-[#282828] text-[#B3B3B3] hover:text-white'
                }`}
              >
                Liked Songs ({likedTracks.length})
              </button>
            </nav>

            {/* Featured Action Cards Grid */}
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
                className="relative overflow-hidden h-44 rounded-3xl bg-gradient-to-br from-[#1DB954] via-[#121212] to-[#181818] p-6 text-white shadow-xl border border-[#282828] group cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500 text-[#1DB954]">
                  <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <span className="material-symbols-outlined text-3xl mb-1 text-[#1DB954]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">Liked Songs</h2>
                    <p className="text-xs opacity-90 font-medium text-[#B3B3B3]">
                      {likedTracks.length > 0 ? `${likedTracks.length} saved tracks` : 'Tap to stream top hits'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest bg-black/40 text-[#1DB954] px-3 py-1 rounded-full w-max backdrop-blur-md border border-[#1DB954]/30">
                    AUTO-SAVED
                  </span>
                </div>
              </div>

              {/* Create Custom Playlist Card */}
              <div
                onClick={() => setShowCreateModal(true)}
                className="h-44 rounded-3xl border-2 border-dashed border-[#282828] flex flex-col items-center justify-center gap-3 text-[#1DB954] bg-[#181818] hover:bg-[#282828] hover:border-[#1DB954]/50 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-[#282828] text-[#1DB954] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <span className="text-sm font-bold text-white group-hover:text-[#1DB954]">Create New Playlist</span>
              </div>
            </div>

            {/* Playlists & Liked Songs Section */}
            <section className="space-y-4 mb-32">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-white">
                  {activeFilter === 'liked' ? 'Your Liked Songs' : 'Your Playlists'}
                </h3>
                {isLoadingPlaylists && (
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
                      className="flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] transition-all cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#282828]">
                        <img className="w-full h-full object-cover" alt={track.title} src={track.coverUrl} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-base font-bold text-white truncate">{track.title}</h4>
                        <p className="text-xs text-[#B3B3B3] truncate font-medium">{track.artist}</p>
                      </div>

                      {/* Action Menu (...) Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSongForMenu(track);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-[#3E3E3E] flex items-center justify-center text-[#B3B3B3] hover:text-white"
                        title="Song Options"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>

                      <span className="material-symbols-outlined text-[#1DB954]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        favorite
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-[#181818] rounded-3xl border border-[#282828]">
                    <span className="material-symbols-outlined text-4xl text-[#1DB954] mb-2">favorite_border</span>
                    <p className="text-sm font-semibold text-white">No liked songs yet</p>
                    <p className="text-xs text-[#B3B3B3] mt-1">Tap the heart icon on any song to save it here.</p>
                  </div>
                )
              ) : (
                playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => openPlaylistDetails(pl)}
                    className="flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#282828] flex items-center justify-center text-[#1DB954] flex-shrink-0 border border-[#3E3E3E]">
                      <span className="material-symbols-outlined text-2xl">queue_music</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-base font-bold text-white truncate">{pl.title}</h4>
                      <p className="text-xs text-[#B3B3B3] font-medium">
                        {pl.description || 'Tap to view tracks'}
                      </p>
                    </div>

                    {/* Quick Delete Playlist Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistToDelete(pl);
                      }}
                      className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center text-[#B3B3B3] hover:text-red-400 transition-colors"
                      title="Delete Playlist"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>

                    <span className="material-symbols-outlined text-[#B3B3B3] group-hover:text-[#1DB954]">
                      chevron_right
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE NEW PLAYLIST MODAL                        */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylist}
            className="bg-[#181818] p-6 rounded-3xl w-full max-w-md shadow-2xl border border-[#282828] space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#282828] pb-3">
              <h3 className="text-lg font-extrabold text-white">Create New Playlist</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#282828] text-[#B3B3B3] hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                className="w-full h-12 px-4 rounded-2xl bg-[#121212] border border-[#282828] outline-none focus:border-[#1DB954] text-sm text-white placeholder-[#B3B3B3]"
                placeholder="Playlist Name (e.g. Acoustic Chill)"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
              />
              <input
                type="text"
                className="w-full h-12 px-4 rounded-2xl bg-[#121212] border border-[#282828] outline-none focus:border-[#1DB954] text-sm text-white placeholder-[#B3B3B3]"
                placeholder="Optional Description"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#282828] text-white hover:bg-[#3E3E3E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newPlaylistTitle.trim()}
                className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#1DB954] hover:bg-[#1ED760] text-black shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DELETE ENTIRE PLAYLIST CONFIRMATION POPUP        */}
      {/* ========================================================= */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-[#282828] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Delete Playlist?</h3>
              <p className="text-xs text-[#B3B3B3] mt-1">
                Are you sure you want to delete <strong className="text-white">"{playlistToDelete.title}"</strong>? This will remove all tracks in this playlist.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPlaylistToDelete(null)}
                className="flex-1 py-3 bg-[#282828] hover:bg-[#3E3E3E] text-white text-xs font-extrabold rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePlaylist}
                disabled={isDeletingPlaylist}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingPlaylist ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Song Options Action Menu Modal */}
      {activeSongForMenu && (
        <SongActionMenuModal
          track={activeSongForMenu}
          onClose={() => setActiveSongForMenu(null)}
        />
      )}

      <BottomNav currentScreen="library" onNavigate={onNavigate} />
    </div>
  );
};
