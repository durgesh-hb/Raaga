import React from 'react';
import { useAudio } from '../context/AudioContext';
import { ScreenType, TransitionType } from '../types';

interface MiniPlayerProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onNavigate }) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    position,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
  } = useAudio();

  if (!currentTrack) return null;

  const totalDuration = duration || currentTrack.duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (position / totalDuration) * 100));

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-22 left-3 right-3 z-40 max-w-xl mx-auto">
      <div
        onClick={() => onNavigate('player', 'slide_up')}
        className="bg-[#181818]/95 backdrop-blur-xl shadow-2xl rounded-2xl p-3 flex items-center gap-3 border border-[#282828] hover:border-[#3E3E3E] cursor-pointer relative transition-all group"
      >
        {/* Track Artwork */}
        <div className="w-12 h-12 rounded-xl bg-[#121212] overflow-hidden flex-shrink-0 relative border border-[#282828]">
          <img
            className="w-full h-full object-cover"
            alt={currentTrack.title}
            src={currentTrack.coverUrl}
          />
          {isBuffering && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1DB954] text-sm animate-spin">
                progress_activity
              </span>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-grow overflow-hidden min-w-0 pr-2">
          <p className="text-sm font-extrabold text-white truncate tracking-tight">
            {currentTrack.title}
          </p>
          <p className="text-xs text-[#B3B3B3] truncate font-medium">
            {currentTrack.artist}
          </p>
        </div>

        {/* Playback Control Buttons */}
        <div
          className="flex items-center gap-1.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={prevTrack}
            className="w-8 h-8 flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors cursor-pointer rounded-full"
            title="Previous Track"
          >
            <span className="material-symbols-outlined text-xl">skip_previous</span>
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-full cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span
              className="material-symbols-outlined text-black text-2xl font-bold"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={nextTrack}
            className="w-8 h-8 flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors cursor-pointer rounded-full"
            title="Next Track"
          >
            <span className="material-symbols-outlined text-xl">skip_next</span>
          </button>
        </div>

        {/* Bottom Progress Seek Bar */}
        <div className="absolute bottom-0 left-3 right-3 h-1 bg-[#282828] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
