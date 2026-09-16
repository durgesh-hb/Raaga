import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, Track, RecommendationSection } from '../types';
import { BottomNav } from './Navigation';
import { PLAYLISTS, TRACKS, USER_PROFILE } from '../data';
import { MusicApiService, mapSongDtoToTrack } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';
import { SongActionMenuModal } from './SongActionMenuModal';
import { OnboardingModal } from './OnboardingModal';

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
    userId,
  } = useAudio();

  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [dynamicTracks, setDynamicTracks] = useState<Track[]>(TRACKS);
  const [recommendationSections, setRecommendationSections] = useState<RecommendationSection[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [activeSongForMenu, setActiveSongForMenu] = useState<Track | null>(null);

  // Fetch Home Recommendations & Initial Tracks
  const loadRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const recData = await MusicApiService.getHomeRecommendations(userId);
      if (recData && recData.sections && recData.sections.length > 0) {
        setRecommendationSections(recData.sections);
        // Prompt onboarding for cold start if user has no preferences set
        if (!recData.hasPreferences) {
          setIsOnboardingOpen(true);
        }
      } else {
        // Fallback: Prompt onboarding if no preferences found
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.warn('Failed to load home recommendations:', err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

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

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [userId]);

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
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-[#282828] hover:bg-[#333] text-[#1DB954] border border-[#1DB954]/30 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            title="Personalize Recommendations"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Personalize</span>
          </button>

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
        <section className="mb-8">
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

        {/* Personalized Recommendations Quick Banner */}
        <section className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-[#1DB954]/20 via-[#181818] to-[#282828] border border-[#1DB954]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-[#1DB954] font-bold text-xs uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Spotify-Style Smart Feed</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">Tailored Recommendations</h3>
            <p className="text-xs text-[#B3B3B3] mt-0.5">Based on your onboarding preferences, liked songs, and listening history.</p>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-5 py-2.5 rounded-full text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
          >
            Customize Preferences
          </button>
        </section>

        {/* Dynamic Personalized Recommendation Carousels */}
        {isLoadingRecs ? (
          <div className="mb-12 space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-[#282828] rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="w-40 h-52 bg-[#181818] border border-[#282828] rounded-2xl p-3 flex-shrink-0" />
              ))}
            </div>
          </div>
        ) : (
          recommendationSections.map((section) => {
            const tracks = section.songs.map(mapSongDtoToTrack);
            if (tracks.length === 0) return null;

            return (
              <section key={section.id} className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{section.title}</h3>
                    <p className="text-xs text-[#B3B3B3] mt-0.5">{section.description}</p>
                  </div>
                </div>

                {/* Horizontal Scrolling Carousel */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                  {tracks.map((track) => {
                    const isSelected = track.id === currentTrack.id;
                    const isTrackFav = favorites.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, tracks)}
                        className={`w-44 flex-shrink-0 bg-[#181818] hover:bg-[#242424] border border-[#282828] p-3.5 rounded-2xl transition-all duration-300 group cursor-pointer snap-start relative flex flex-col justify-between ${
                          isSelected ? 'border-[#1DB954] bg-[#242424]' : ''
                        }`}
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Hover Play Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) togglePlay();
                                else playTrack(track, tracks);
                              }}
                              className={`absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg transition-all duration-300 ${
                                isSelected
                                  ? 'opacity-100 scale-100'
                                  : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[#121212]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isSelected && isPlaying ? 'pause' : 'play_arrow'}
                              </span>
                            </button>
                          </div>

                          <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          <p className="text-xs text-[#B3B3B3] font-medium truncate mt-0.5">{track.artist}</p>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#282828]/50">
                          <span className="text-[10px] uppercase font-bold text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                            {track.genre || track.language || 'Music'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track.id);
                            }}
                            className="text-[#B3B3B3] hover:text-[#1DB954] transition-colors p-1"
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={isTrackFav ? { fontVariationSettings: "'FILL' 1", color: '#1DB954' } : {}}
                            >
                              {isTrackFav ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

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

        {/* Featured Songs List */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              Top Trending Chart Tracks
            </h3>
            {isLoadingTracks && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1DB954]">
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
                <span>Loading tracks...</span>
              </div>
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

      {/* Cold Start / Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaved={loadRecommendations}
      />

      <BottomNav currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
};
