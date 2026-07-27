import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, Track } from '../types';
import { BottomNav } from './Navigation';
import { PLAYLISTS, TRACKS, USER_PROFILE } from '../data';
import { MusicApiService } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';

interface SearchHomeScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onSearchGenre?: (genre: string) => void;
}

export const SearchHomeScreen: React.FC<SearchHomeScreenProps> = ({
  onNavigate,
  onSearchGenre,
}) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    position,
    duration,
    playTrack,
    togglePlay,
    nextTrack,
    favorites,
    toggleFavorite,
    addToQueue,
  } = useAudio();

  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [dynamicTracks, setDynamicTracks] = useState<Track[]>(TRACKS);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTracks(true);
    MusicApiService.searchSongs('Top Hindi Songs')
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setDynamicTracks(res);
        }
      })
      .catch((err) => {
        console.warn('SearchHomeScreen dynamic fetch fallback:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTracks(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalDuration = duration || currentTrack.duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (position / totalDuration) * 100));
  const isFav = favorites.includes(currentTrack.id);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearchQuery.trim()) {
      if (onSearchGenre) onSearchGenre(homeSearchQuery.trim());
      onNavigate('search', 'push');
    } else {
      onNavigate('search', 'push');
    }
  };

  const handleGenreClick = (genre: string) => {
    if (onSearchGenre) onSearchGenre(genre);
    onNavigate('search', 'push');
  };

  return (
    <div className="bg-[#f4faff] dark:bg-[#0b1319] text-[#141d21] dark:text-[#e2e8f0] min-h-screen pb-40 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-[#0b1319]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 h-16 shadow-[0_8px_32px_rgba(14,165,233,0.08)] border-b border-[#e0f2fe] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006591] to-[#0ea5e9] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              cloud
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#006591] dark:text-[#38bdf8] tracking-tight">
            RAGGA <span className="text-xs px-2 py-0.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">MUSIC</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate('home', 'none')}
            className="text-[#006591] dark:text-[#38bdf8] font-bold text-sm cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('search', 'none')}
            className="text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-colors text-sm cursor-pointer"
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('library', 'none')}
            className="text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-colors text-sm cursor-pointer"
          >
            Library
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('settings', 'push')}
            className="material-symbols-outlined text-[#3e4850] dark:text-slate-300 hover:bg-[#0ea5e9]/10 p-2 rounded-full transition-colors cursor-pointer"
            title="Settings"
          >
            settings
          </button>
          <div
            onClick={() => onNavigate('settings', 'push')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0ea5e9]/30 cursor-pointer shadow-sm"
          >
            <img
              className="w-full h-full object-cover"
              alt="User Profile"
              src={USER_PROFILE.avatarUrl}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 mt-6">
        {/* Search Banner Input */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#141d21] dark:text-white">
            Discover Music
          </h2>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#006591] dark:text-[#38bdf8]">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-28 bg-white dark:bg-slate-900 border border-[#e0f2fe] dark:border-slate-800 text-[#141d21] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#006591]/30 outline-none sky-shadow transition-all text-base md:text-lg"
              placeholder="Search artists, songs, podcasts, or genres..."
              type="text"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              {homeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHomeSearchQuery('')}
                  className="text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] p-1 cursor-pointer"
                  title="Clear input"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
              <button
                type="submit"
                className="bg-[#006591] dark:bg-[#0ea5e9] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Trending Genres Bento Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#141d21] dark:text-white">Trending Indian Genres</h3>
            <button
              onClick={() => onNavigate('search', 'push')}
              className="text-[#006591] dark:text-[#38bdf8] text-sm font-semibold hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Bollywood Genre Card */}
            <div
              onClick={() => handleGenreClick('Bollywood')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden sky-shadow group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006591]/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Bollywood</span>
              </div>
            </div>

            {/* Punjabi Genre Card */}
            <div
              onClick={() => handleGenreClick('Punjabi')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden sky-shadow group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006686]/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Punjabi Hits</span>
              </div>
            </div>

            {/* Classical Genre Card */}
            <div
              onClick={() => handleGenreClick('Indian Classical')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden sky-shadow group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8a5100]/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Indian Classical</span>
              </div>
            </div>

            {/* Indie India Genre Card */}
            <div
              onClick={() => handleGenreClick('Indie India')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden sky-shadow group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#006591]/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Indie India</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Songs & Playlists */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#141d21] dark:text-white">
              Featured Live Tracks
            </h3>
            {isLoadingTracks && (
              <span className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8] animate-spin text-sm">
                progress_activity
              </span>
            )}
          </div>
          <div className="space-y-3">
            {dynamicTracks.map((track) => {
              const isSelected = track.id === currentTrack.id;
              const isTrackFav = favorites.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, dynamicTracks)}
                  className={`flex items-center p-3.5 bg-white dark:bg-slate-900 border border-[#e0f2fe] dark:border-slate-800 rounded-2xl sky-shadow hover:bg-[#ecf5fb] dark:hover:bg-slate-800/80 transition-all group cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#006591] dark:ring-[#38bdf8]' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative">
                    <img
                      className="w-full h-full object-cover"
                      alt={track.title}
                      src={track.coverUrl}
                    />
                    {isSelected && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1">
                        <div className="w-1 bg-white h-4 animate-bounce" />
                        <div className="w-1 bg-white h-6 animate-bounce delay-100" />
                        <div className="w-1 bg-white h-3 animate-bounce delay-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 pr-4">
                    <h4 className="text-base font-bold text-[#141d21] dark:text-white truncate">
                      {track.title}
                    </h4>
                    <p className="text-[#006591] dark:text-[#38bdf8] text-xs font-medium truncate">
                      {track.artist} • <span className="text-[#3e4850] dark:text-slate-400">{track.album}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="material-symbols-outlined text-[#3e4850] dark:text-slate-400 hover:text-[#006591] dark:hover:text-[#38bdf8] transition-colors p-2"
                      title="Add to Queue"
                    >
                      playlist_add
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="material-symbols-outlined text-[#3e4850] dark:text-slate-400 hover:text-[#006591] transition-colors p-2"
                      style={isTrackFav ? { fontVariationSettings: "'FILL' 1", color: '#006591' } : {}}
                    >
                      {isTrackFav ? 'favorite' : 'favorite_border'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) togglePlay();
                        else playTrack(track, TRACKS);
                      }}
                      className="material-symbols-outlined text-[#006591] dark:text-[#38bdf8] hover:scale-110 transition-transform p-2"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isSelected && isPlaying ? 'pause_circle' : 'play_circle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Mini Player */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6 left-4 md:left-1/2 md:-translate-x-1/2 right-4 md:w-[600px] z-40">
        <div
          onClick={() => onNavigate('player', 'slide_up')}
          className="glass-card-elevated rounded-2xl p-3 sky-shadow flex items-center justify-between border-[#0ea5e9]/20 dark:border-slate-800 cursor-pointer relative"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/20 flex-shrink-0 overflow-hidden shadow-sm relative">
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
            <div className="truncate pr-2">
              <h5 className="text-sm font-bold text-[#141d21] dark:text-white truncate">
                {currentTrack.title}
              </h5>
              <p className="text-[#006591] dark:text-[#38bdf8] text-xs font-semibold truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="material-symbols-outlined p-2 text-[#3e4850] dark:text-slate-300 hover:text-[#006591] transition-colors"
              style={isFav ? { fontVariationSettings: "'FILL' 1", color: '#006591' } : {}}
            >
              {isFav ? 'favorite' : 'favorite_border'}
            </button>
            <button
              onClick={togglePlay}
              className="bg-[#006591] dark:bg-[#0ea5e9] text-white w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={nextTrack}
              className="material-symbols-outlined p-2 text-[#3e4850] dark:text-slate-300 hover:text-[#006591] transition-colors"
            >
              skip_next
            </button>
          </div>
          {/* Real Audio Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e6eff5] dark:bg-slate-800 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-[#0ea5e9] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <BottomNav currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
};
