import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, Track } from '../types';
import { BottomNav } from './Navigation';
import { PLAYLISTS, TRACKS, USER_PROFILE } from '../data';
import { MusicApiService } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';
import { SongActionMenuModal } from './SongActionMenuModal';

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
  const [activeSongForMenu, setActiveSongForMenu] = useState<Track | null>(null);

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
    <div className="bg-[#121212] text-white min-h-screen pb-40 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 h-16 border-b border-[#282828] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1DB954] flex items-center justify-center text-black shadow-md font-bold">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              graphic_eq
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            RAAGA <span className="text-xs px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954]">PREMIUM</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate('home', 'none')}
            className="text-[#1DB954] font-bold text-sm cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('search', 'none')}
            className="text-[#B3B3B3] hover:text-white transition-colors text-sm cursor-pointer"
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('library', 'none')}
            className="text-[#B3B3B3] hover:text-white transition-colors text-sm cursor-pointer"
          >
            Library
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('settings', 'push')}
            className="material-symbols-outlined text-[#B3B3B3] hover:text-white hover:bg-[#282828] p-2 rounded-full transition-colors cursor-pointer"
            title="Settings"
          >
            settings
          </button>
          <div
            onClick={() => onNavigate('settings', 'push')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#1DB954]/40 cursor-pointer shadow-sm"
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
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">
            Discover Music
          </h2>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#B3B3B3] group-focus-within:text-[#1DB954]">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-28 bg-[#282828] border border-transparent text-white placeholder-[#B3B3B3] rounded-2xl focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] outline-none shadow-md transition-all text-base md:text-lg"
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
                  className="text-[#B3B3B3] hover:text-white p-1 cursor-pointer"
                  title="Clear input"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
              <button
                type="submit"
                className="bg-[#1DB954] hover:bg-[#1ED760] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Trending Genres Bento Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-white">Trending Genres</h3>
            <button
              onClick={() => onNavigate('search', 'push')}
              className="text-[#1DB954] text-sm font-semibold hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Bollywood Genre Card */}
            <div
              onClick={() => handleGenreClick('Bollywood')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Bollywood</span>
              </div>
            </div>

            {/* Punjabi Genre Card */}
            <div
              onClick={() => handleGenreClick('Punjabi')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Punjabi Hits</span>
              </div>
            </div>

            {/* Classical Genre Card */}
            <div
              onClick={() => handleGenreClick('Indian Classical')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Classical</span>
              </div>
            </div>

            {/* Indie India Genre Card */}
            <div
              onClick={() => handleGenreClick('Indie India')}
              className="relative aspect-square md:aspect-auto md:h-60 rounded-2xl overflow-hidden shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xl font-extrabold tracking-wide">Indie India</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Songs & Playlists */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              Featured Tracks
            </h3>
            {isLoadingTracks && (
              <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
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
                  className={`flex items-center p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] active:bg-[#282828] transition-all group cursor-pointer ${
                    isSelected ? 'border-[#1DB954] bg-[#282828]' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative">
                    <img
                      className="w-full h-full object-cover"
                      alt={track.title}
                      src={track.coverUrl}
                    />
                    {isSelected && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1">
                        <div className="w-1 bg-[#1DB954] h-4 animate-bounce" />
                        <div className="w-1 bg-[#1ED760] h-6 animate-bounce delay-100" />
                        <div className="w-1 bg-[#1DB954] h-3 animate-bounce delay-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 pr-4">
                    <h4 className={`text-base font-bold truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <p className="text-[#B3B3B3] text-xs font-medium truncate">
                      {track.artist} • <span className="opacity-75">{track.album}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSongForMenu(track);
                      }}
                      className="material-symbols-outlined text-[#B3B3B3] hover:text-white transition-colors p-2"
                      title="Song Options"
                    >
                      more_vert
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="material-symbols-outlined text-[#B3B3B3] hover:text-[#1DB954] transition-colors p-2"
                      style={isTrackFav ? { fontVariationSettings: "'FILL' 1", color: '#1DB954' } : {}}
                    >
                      {isTrackFav ? 'favorite' : 'favorite_border'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) togglePlay();
                        else playTrack(track, dynamicTracks);
                      }}
                      className="material-symbols-outlined text-[#1DB954] hover:text-[#1ED760] hover:scale-110 transition-all p-2"
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
          className="bg-[#282828] rounded-2xl p-3 shadow-2xl flex items-center justify-between border border-[#3E3E3E] cursor-pointer relative"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#181818] flex-shrink-0 overflow-hidden shadow-sm relative">
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
            <div className="truncate pr-2">
              <h5 className="text-sm font-bold text-white truncate">
                {currentTrack.title}
              </h5>
              <p className="text-[#B3B3B3] text-xs font-semibold truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="material-symbols-outlined p-2 text-[#B3B3B3] hover:text-[#1DB954] transition-colors"
              style={isFav ? { fontVariationSettings: "'FILL' 1", color: '#1DB954' } : {}}
            >
              {isFav ? 'favorite' : 'favorite_border'}
            </button>
            <button
              onClick={togglePlay}
              className="bg-[#1DB954] hover:bg-[#1ED760] text-black w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={nextTrack}
              className="material-symbols-outlined p-2 text-[#B3B3B3] hover:text-white transition-colors"
            >
              skip_next
            </button>
          </div>
          {/* Real Audio Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#535353] rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-[#1DB954] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Song Action Menu Modal */}
      {activeSongForMenu && (
        <SongActionMenuModal
          track={activeSongForMenu}
          onClose={() => setActiveSongForMenu(null)}
        />
      )}

      <BottomNav currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
};
