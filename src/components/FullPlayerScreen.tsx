import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';
import { useAudio } from '../context/AudioContext';

interface FullPlayerScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const FullPlayerScreen: React.FC<FullPlayerScreenProps> = ({ onNavigate }) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    position,
    duration,
    seek,
    skipForward,
    skipBackward,
    togglePlay,
    nextTrack,
    prevTrack,
    favorites,
    toggleFavorite,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    queue,
    playTrack,
    removeFromQueue,
    clearQueue,
    volume,
    setVolume,
    playbackSpeed,
    setPlaybackSpeed,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [showVolumeBar, setShowVolumeBar] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isFavorite = favorites.includes(currentTrack.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 15;
    const y = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -15;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDuration = duration || currentTrack.duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (position / totalDuration) * 100));

  return (
    <div className="bg-gradient-to-b from-[#f4faff] via-[#e0f2fe] to-[#f4faff] dark:from-[#0b1319] dark:via-[#0f2b3c] dark:to-[#0b1319] min-h-screen text-[#141d21] dark:text-[#e2e8f0] pb-32 flex flex-col justify-between transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-white/60 dark:bg-black/40 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 h-16 shadow-[0_8px_32px_rgba(14,165,233,0.08)]">
        <button
          onClick={() => onNavigate('back' as any, 'push_back')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0ea5e9]/10 transition-colors active:scale-95 duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]">
            keyboard_arrow_down
          </span>
        </button>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#e0e9ef]/60 dark:bg-slate-800/60 p-1 rounded-full border border-white/40 dark:border-white/10">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'player'
                ? 'bg-[#006591] text-white shadow-md'
                : 'text-[#3e4850] dark:text-slate-300 hover:text-[#006591]'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'lyrics'
                ? 'bg-[#006591] text-white shadow-md'
                : 'text-[#3e4850] dark:text-slate-300 hover:text-[#006591]'
            }`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#006591] text-white shadow-md'
                : 'text-[#3e4850] dark:text-slate-300 hover:text-[#006591]'
            }`}
          >
            Queue ({queue.length})
          </button>
        </div>

        <button
          onClick={() => setShowVolumeBar((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0ea5e9]/10 transition-colors active:scale-95 duration-200 cursor-pointer"
          title="Toggle Volume Slider"
        >
          <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]">
            {volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
          </span>
        </button>
      </header>

      {/* Floating Volume Slider Bar */}
      {showVolumeBar && (
        <div className="w-full max-w-sm mx-auto px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-[#0ea5e9]/20 flex items-center gap-3 my-2 animate-fadeIn">
          <span className="material-symbols-outlined text-xs text-[#006591] dark:text-[#38bdf8]">
            volume_down
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#0ea5e9]/30 rounded-lg appearance-none cursor-pointer accent-[#006591]"
          />
          <span className="text-xs font-mono font-bold text-[#006591] dark:text-[#38bdf8]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Main Content View */}
      <main className="max-w-screen-md mx-auto px-4 pt-4 pb-8 flex flex-col items-center w-full my-auto">
        {activeTab === 'player' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Album Art Canvas */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-square max-w-[360px] group transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
              }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#0ea5e9]/30 blur-[64px] rounded-full scale-95 group-hover:scale-105 transition-transform duration-700" />

              {/* Album Card */}
              <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-[0_24px_48px_rgba(14,165,233,0.2)] border border-white/50 dark:border-white/10">
                <img
                  className="w-full h-full object-cover"
                  alt={currentTrack.title}
                  src={currentTrack.coverUrl}
                />

                {/* Animated Sound Visualizer Overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                  <div className="flex gap-1.5 items-end h-9">
                    <div
                      className={`w-1.5 bg-white/90 rounded-full transition-all ${
                        isPlaying && !isBuffering ? 'animate-[bounce_0.8s_infinite]' : 'h-3'
                      }`}
                    />
                    <div
                      className={`w-1.5 bg-white rounded-full transition-all ${
                        isPlaying && !isBuffering ? 'animate-[bounce_1.2s_infinite]' : 'h-6'
                      }`}
                    />
                    <div
                      className={`w-1.5 bg-white/70 rounded-full transition-all ${
                        isPlaying && !isBuffering ? 'animate-[bounce_0.6s_infinite]' : 'h-2'
                      }`}
                    />
                    <div
                      className={`w-1.5 bg-white/90 rounded-full transition-all ${
                        isPlaying && !isBuffering ? 'animate-[bounce_1.4s_infinite]' : 'h-5'
                      }`}
                    />
                  </div>
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                      {isBuffering ? 'BUFFERING STREAM...' : `${playbackSpeed}X LOSSLESS`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Song Metadata */}
            <div className="w-full max-w-[440px] mt-6 flex items-center justify-between">
              <div className="flex flex-col min-w-0 pr-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#141d21] dark:text-white truncate">
                  {currentTrack.title}
                </h1>
                <p className="text-base text-[#006591] dark:text-[#38bdf8] font-medium truncate mt-0.5">
                  {currentTrack.artist} • <span className="opacity-80">{currentTrack.album}</span>
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#0ea5e9]/10 transition-colors text-[#006591] dark:text-[#38bdf8] cursor-pointer flex-shrink-0"
              >
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {isFavorite ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>

            {/* Audio Progress Bar */}
            <div className="w-full max-w-[440px] mt-5">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seek(pct * totalDuration);
                }}
                className="relative w-full h-2.5 bg-[#e0e9ef] dark:bg-slate-700/80 rounded-full overflow-hidden cursor-pointer group shadow-inner"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#006591] to-[#0ea5e9] rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-semibold text-[#3e4850] dark:text-slate-400">
                <span>{formatTime(position)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center gap-2 mt-2">
              {[1.0, 1.25, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#006591] dark:bg-[#0ea5e9] text-white shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800/60 text-[#3e4850] dark:text-slate-300 hover:bg-[#0ea5e9]/20'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Audio Controls */}
            <div className="w-full max-w-[440px] mt-5 flex items-center justify-between">
              <button
                onClick={toggleShuffle}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isShuffle
                    ? 'text-[#0ea5e9] bg-[#0ea5e9]/15'
                    : 'text-[#3e4850] dark:text-slate-400 hover:bg-[#e0e9ef] dark:hover:bg-slate-800'
                }`}
                title="Shuffle"
              >
                <span className="material-symbols-outlined text-[22px]">shuffle</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => skipBackward(10)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#3e4850] dark:text-slate-400 hover:bg-[#0ea5e9]/15 transition-all active:scale-90 cursor-pointer"
                  title="Rewind 10s"
                >
                  <span className="material-symbols-outlined text-[22px]">replay_10</span>
                </button>

                <button
                  onClick={prevTrack}
                  className="w-12 h-12 flex items-center justify-center rounded-full text-[#006591] dark:text-[#38bdf8] hover:bg-[#0ea5e9]/15 transition-all active:scale-90 cursor-pointer"
                  title="Previous Track"
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    skip_previous
                  </span>
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-[#006591] dark:bg-[#0ea5e9] text-white shadow-[0_12px_28px_rgba(14,165,233,0.4)] hover:scale-105 transition-all active:scale-95 cursor-pointer relative"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isBuffering ? (
                    <span className="material-symbols-outlined text-[32px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span
                      className="material-symbols-outlined text-[40px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  className="w-12 h-12 flex items-center justify-center rounded-full text-[#006591] dark:text-[#38bdf8] hover:bg-[#0ea5e9]/15 transition-all active:scale-90 cursor-pointer"
                  title="Next Track"
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    skip_next
                  </span>
                </button>

                <button
                  onClick={() => skipForward(10)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#3e4850] dark:text-slate-400 hover:bg-[#0ea5e9]/15 transition-all active:scale-90 cursor-pointer"
                  title="Forward 10s"
                >
                  <span className="material-symbols-outlined text-[22px]">forward_10</span>
                </button>
              </div>

              <button
                onClick={toggleRepeat}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isRepeat
                    ? 'text-[#0ea5e9] bg-[#0ea5e9]/15'
                    : 'text-[#3e4850] dark:text-slate-400 hover:bg-[#e0e9ef] dark:hover:bg-slate-800'
                }`}
                title="Repeat"
              >
                <span className="material-symbols-outlined text-[22px]">repeat</span>
              </button>
            </div>
          </div>
        )}

        {/* Lyrics Tab */}
        {activeTab === 'lyrics' && (
          <div className="w-full max-w-[520px] bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-[32px] shadow-xl border border-white/60 dark:border-white/10 flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#bec8d2]/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#006591] dark:text-[#38bdf8]">
                  Song Lyrics & Insights
                </h2>
                <p className="text-xs text-[#3e4850] dark:text-slate-400">
                  {currentTrack.title} — {currentTrack.artist}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#0ea5e9]">subtitles</span>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-4 text-center px-2 py-4">
              {currentTrack.lyrics ? (
                currentTrack.lyrics.split('\n').map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-base md:text-lg font-medium transition-all ${
                      idx === 2
                        ? 'text-[#006591] dark:text-[#38bdf8] font-bold text-xl scale-105'
                        : 'text-[#3e4850] dark:text-slate-300 opacity-80'
                    }`}
                  >
                    {line.replace(/\[\d+:\d+\.\d+\]/, '')}
                  </p>
                ))
              ) : (
                <div className="py-12 text-[#3e4850] dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-[#0ea5e9]">
                    graphic_eq
                  </span>
                  <p className="text-sm font-semibold">
                    Dynamic lyrics for this track are being synchronized.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Up Next Queue Tab */}
        {activeTab === 'queue' && (
          <div className="w-full max-w-[520px] bg-white/80 dark:bg-slate-900/80 p-6 rounded-[32px] shadow-xl border border-white/60 dark:border-white/10 animate-fadeIn">
            <h2 className="text-xl font-bold text-[#141d21] dark:text-white mb-4 flex items-center justify-between">
              <span>Up Next</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#006591] dark:text-[#38bdf8] font-semibold">
                  {queue.length} Tracks
                </span>
                {queue.length > 1 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                  >
                    Clear Queue
                  </button>
                )}
              </div>
            </h2>

            <div className="max-h-[380px] overflow-y-auto space-y-2">
              {queue.map((track, i) => {
                const isSelected = track.id === currentTrack.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#006591]/15 text-[#006591] dark:text-[#38bdf8] font-bold border border-[#0ea5e9]/30'
                        : 'hover:bg-[#e0e9ef] dark:hover:bg-slate-800 text-[#141d21] dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-mono w-5 text-center text-[#3e4850] dark:text-slate-400">
                      {i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt={track.title}
                        src={track.coverUrl}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold truncate">{track.title}</p>
                      <p className="text-xs opacity-75 truncate">{track.artist}</p>
                    </div>
                    {isSelected ? (
                      <span
                        className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        equalizer
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(track.id);
                        }}
                        className="material-symbols-outlined text-sm text-[#3e4850] dark:text-slate-400 hover:text-red-500 p-1"
                        title="Remove from queue"
                      >
                        close
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-[#bec8d2]/30 dark:border-slate-800 shadow-lg">
        <button
          onClick={() => onNavigate('home', 'none')}
          className="flex flex-col items-center justify-center text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium mt-0.5">Home</span>
        </button>
        <button
          onClick={() => onNavigate('search', 'none')}
          className="flex flex-col items-center justify-center text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">search</span>
          <span className="text-xs font-medium mt-0.5">Search</span>
        </button>
        <button
          onClick={() => onNavigate('library', 'none')}
          className="flex flex-col items-center justify-center text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">library_music</span>
          <span className="text-xs font-medium mt-0.5">Library</span>
        </button>
        <button
          onClick={() => onNavigate('settings', 'push')}
          className="flex flex-col items-center justify-center text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">workspace_premium</span>
          <span className="text-xs font-medium mt-0.5">Premium</span>
        </button>
      </nav>
    </div>
  );
};
