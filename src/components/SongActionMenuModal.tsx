import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Track, Playlist } from '../types';
import {
  fetchUserPlaylists,
  addSongToPlaylist,
  createPlaylist,
} from '../services/supabaseClient';
import { useAudio } from '../context/AudioContext';

interface SongActionMenuModalProps {
  track: Track | null;
  onClose: () => void;
  onTrackLikedToggle?: (trackId: string) => void;
}

export const SongActionMenuModal: React.FC<SongActionMenuModalProps> = ({
  track,
  onClose,
  onTrackLikedToggle,
}) => {
  const { playTrack, addToQueue, showToast, favorites, toggleFavorite } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Inline Create Playlist State
  const [showCreateInline, setShowCreateInline] = useState<boolean>(false);
  const [newTitleInline, setNewTitleInline] = useState<string>('');
  const [isCreatingInline, setIsCreatingInline] = useState<boolean>(false);

  useEffect(() => {
    if (track) {
      setIsLoadingPlaylists(true);
      fetchUserPlaylists()
        .then((data) => setPlaylists(data || []))
        .catch(console.warn)
        .finally(() => setIsLoadingPlaylists(false));
    }
  }, [track]);

  if (!track) return null;

  const isFav = track.isFavorite || favorites.includes(track.id);

  const handleAddToPlaylist = async (playlistId: string, playlistTitle: string) => {
    setIsAdding(true);
    try {
      await addSongToPlaylist(playlistId, track);
      showToast(`Added "${track.title}" to "${playlistTitle}"!`);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add song to playlist');
    } finally {
      setIsAdding(false);
    }
  };

  const handleInlineCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleInline.trim()) return;

    setIsCreatingInline(true);
    const title = newTitleInline.trim();
    try {
      const created = await createPlaylist(title);
      if (created) {
        setPlaylists((prev) => [created, ...prev]);
        setNewTitleInline('');
        setShowCreateInline(false);
        await handleAddToPlaylist(created.id, created.title);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create playlist');
    } finally {
      setIsCreatingInline(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#181818] border border-[#282828] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5"
        >
          {/* Header Track Card */}
          <div className="flex items-center gap-4 border-b border-[#282828] pb-4">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-14 h-14 rounded-2xl object-cover shadow-md border border-[#282828]"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate">{track.title}</h3>
              <p className="text-xs text-[#B3B3B3] truncate">{track.artist}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center text-[#B3B3B3] hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {!showPlaylistSelector ? (
            /* Main Actions List */
            <div className="space-y-2">
              {/* Play Track */}
              <button
                onClick={() => {
                  playTrack(track);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#121212] hover:bg-[#282828] border border-[#282828] text-white text-sm font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#1DB954]">play_circle</span>
                <span>Play Track Now</span>
              </button>

              {/* Add to Queue */}
              <button
                onClick={() => {
                  addToQueue(track);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#121212] hover:bg-[#282828] border border-[#282828] text-white text-sm font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-white">queue_music</span>
                <span>Add to Playback Queue</span>
              </button>

              {/* Add to Custom Playlist */}
              <button
                onClick={() => setShowPlaylistSelector(true)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#121212] hover:bg-[#282828] border border-[#282828] text-white text-sm font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#1DB954]">playlist_add</span>
                <span>Add to Custom Playlist</span>
              </button>

              {/* Like / Favorite Track */}
              <button
                onClick={() => {
                  toggleFavorite(track.id);
                  if (onTrackLikedToggle) onTrackLikedToggle(track.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#121212] hover:bg-[#282828] border border-[#282828] text-white text-sm font-bold transition-all cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined ${isFav ? 'text-red-500' : 'text-gray-400'}`}
                  style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  favorite
                </span>
                <span>{isFav ? 'Remove from Liked Songs' : 'Save to Liked Songs'}</span>
              </button>
            </div>
          ) : (
            /* Playlist Selector List */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Select Destination Playlist</h4>
                <button
                  onClick={() => {
                    setShowPlaylistSelector(false);
                    setShowCreateInline(false);
                  }}
                  className="text-xs text-[#1DB954] hover:underline font-bold"
                >
                  Back to actions
                </button>
              </div>

              {/* Create Playlist Button / Inline Form */}
              {!showCreateInline ? (
                <button
                  onClick={() => setShowCreateInline(true)}
                  className="w-full p-3 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/40 hover:bg-[#1DB954]/20 text-[#1DB954] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Create New Playlist</span>
                </button>
              ) : (
                <form onSubmit={handleInlineCreateAndAdd} className="p-3 bg-[#121212] rounded-2xl border border-[#1DB954]/40 space-y-2">
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="New Playlist Name..."
                    value={newTitleInline}
                    onChange={(e) => setNewTitleInline(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#181818] border border-[#282828] text-xs text-white placeholder-[#B3B3B3] outline-none focus:border-[#1DB954]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateInline(false)}
                      className="px-3 py-1.5 rounded-xl bg-[#282828] text-white text-[11px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingInline || !newTitleInline.trim()}
                      className="px-4 py-1.5 rounded-xl bg-[#1DB954] text-black text-[11px] font-extrabold disabled:opacity-50"
                    >
                      {isCreatingInline ? 'Creating...' : 'Create & Add'}
                    </button>
                  </div>
                </form>
              )}

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {isLoadingPlaylists ? (
                  <div className="py-6 text-center text-xs text-[#B3B3B3] flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[#1DB954] animate-spin text-base">
                      progress_activity
                    </span>
                    <span>Loading playlists...</span>
                  </div>
                ) : playlists.length > 0 ? (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      disabled={isAdding}
                      onClick={() => handleAddToPlaylist(pl.id, pl.title)}
                      className="w-full text-left p-3.5 rounded-2xl bg-[#121212] hover:bg-[#1DB954]/20 border border-[#282828] hover:border-[#1DB954] text-xs font-bold text-white flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#1DB954]">library_music</span>
                        <span className="truncate">{pl.title}</span>
                      </div>
                      <span className="material-symbols-outlined text-sm text-[#1DB954]">add</span>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-[#B3B3B3]">
                    No playlists created yet. Click above to create one!
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

