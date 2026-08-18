import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, TransitionType, Track } from '../types';
import { BottomNav } from './Navigation';
import { CATEGORIES, IMAGINE_DRAGONS_ARTIST, USER_PROFILE } from '../data';
import { MusicApiService } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';
import { SongActionMenuModal } from './SongActionMenuModal';

interface SearchExplorerScreenProps {
  initialSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const SearchExplorerScreen: React.FC<SearchExplorerScreenProps> = ({
  initialSearchQuery = '',
  onSearchQueryChange,
  onNavigate,
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
    networkError,
    queue,
  } = useAudio();

  const [searchValue, setSearchValue] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [trendingPicks, setTrendingPicks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeSongForMenu, setActiveSongForMenu] = useState<Track | null>(null);

  const executeSearch = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const liveResults = await MusicApiService.searchSongs(query);
      if (liveResults && liveResults.length > 0) {
        setSearchResults(liveResults);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.warn('Live Render backend search error:', err);
      const isColdStart = err?.message?.includes('cold start') || err?.message?.includes('timeout') || err?.message?.includes('spinning up');
      setApiError(
        isColdStart
          ? 'Live Render container is waking up from cold start. Tap Retry in a few seconds.'
          : 'Unable to connect to live Render backend. Tap Retry.'
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch live trending picks on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTrending(true);
    MusicApiService.searchSongs('Bollywood Top 50')
      .then((fetched) => {
        if (isMounted && fetched && fetched.length > 0) {
          setTrendingPicks(fetched);
        }
      })
      .catch((err) => {
        console.warn('[SearchExplorerScreen] Failed to load trending picks:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTrending(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery !== searchValue) {
      setSearchValue(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (searchValue.trim()) {
      const timer = setTimeout(() => {
        executeSearch(searchValue);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchValue, executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      if (onSearchQueryChange) onSearchQueryChange(searchValue.trim());
      executeSearch(searchValue.trim());
    }
  };

  const handleCategoryClick = (categoryTitle: string) => {
    setSearchValue(categoryTitle);
    if (onSearchQueryChange) onSearchQueryChange(categoryTitle);
    executeSearch(categoryTitle);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    if (onSearchQueryChange) onSearchQueryChange('');
  };

  const totalDuration = duration || currentTrack.duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (position / totalDuration) * 100));

  return (
    <div className="bg-[#121212] text-white min-h-screen pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 h-16 border-b border-[#282828] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center overflow-hidden border border-[#282828]">
            <img
              className="w-full h-full object-cover"
              alt="User Avatar"
              src={USER_PROFILE.avatarUrl}
            />
          </div>
          <h1 className="text-xl font-extrabold text-white">
            RAAGA Search
          </h1>
        </div>
        <button
          onClick={() => onNavigate('settings', 'push')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#282828] transition-colors text-[#B3B3B3] hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 pt-6 pb-20">
        {/* Search Input Section */}
        <section className="mb-8">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#B3B3B3] group-focus-within:text-[#1DB954]">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-24 rounded-2xl border border-transparent bg-[#282828] focus:outline-none focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] transition-all text-base md:text-lg text-white placeholder-[#B3B3B3]"
              placeholder="Search songs, artists, genres..."
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-[#B3B3B3] hover:text-white p-1 cursor-pointer"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
              {isLoading && (
                <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
                  progress_activity
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Network Banners */}
        {apiError && searchValue.trim() !== '' && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">wifi_off</span>
              <span className="text-sm font-medium">{apiError}</span>
            </div>
            <button
              onClick={() => executeSearch(searchValue)}
              className="px-3 py-1 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {networkError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium">{networkError}</span>
          </div>
        )}

        {/* INLINE LIVE SEARCH RESULTS MODE */}
        {searchValue.trim() ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Result Banner */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Top Match
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="text-xs text-[#1DB954] font-bold hover:underline cursor-pointer"
                >
                  Clear Results
                </button>
              </div>
              <div className="bg-[#181818] rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border border-[#282828]">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-xl flex-shrink-0 border-2 border-[#282828]">
                  <img
                    className="w-full h-full object-cover"
                    alt={searchResults.length > 0 ? searchResults[0].artist : IMAGINE_DRAGONS_ARTIST.name}
                    src={searchResults.length > 0 ? searchResults[0].coverUrl : IMAGINE_DRAGONS_ARTIST.imageUrl}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center">
                  <span className="inline-block px-3 py-1 bg-[#1DB954]/15 text-[#1DB954] rounded-full text-[10px] font-extrabold mb-2 uppercase tracking-widest">
                    LIVE MATCH
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                    {searchResults.length > 0 ? searchResults[0].artist : 'Search Results'}
                  </h3>
                  <p className="text-xs text-[#B3B3B3] mb-4">
                    Dynamic track stream from Java Backend API
                  </p>
                  {searchResults.length > 0 && (
                    <button
                      onClick={() => {
                        playTrack(searchResults[0], searchResults);
                        onNavigate('player', 'slide_up');
                      }}
                      className="bg-[#1DB954] hover:bg-[#1ED760] text-black px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-md"
                    >
                      <span className="material-symbols-outlined text-sm text-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                      Play Top Track
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Results Tracks List */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                Songs & Tracks ({searchResults.length})
              </h2>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center text-[#1DB954]">
                  <span className="material-symbols-outlined text-3xl animate-spin mb-2">
                    progress_activity
                  </span>
                  <span className="text-xs font-semibold">Searching catalog...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {searchResults.map((track) => {
                    const isSelected = track.id === currentTrack.id;
                    const isFav = favorites.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          playTrack(track, searchResults);
                          onNavigate('player', 'slide_up');
                        }}
                        className={`flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] active:bg-[#282828] transition-all group cursor-pointer ${
                          isSelected ? 'border-[#1DB954] bg-[#282828]' : ''
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm relative">
                          <img
                            className="w-full h-full object-cover"
                            alt={track.title}
                            src={track.coverUrl}
                          />
                          {isSelected && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                              <div className="w-0.5 bg-[#1DB954] h-3 animate-bounce" />
                              <div className="w-0.5 bg-[#1ED760] h-4 animate-bounce delay-100" />
                              <div className="w-0.5 bg-[#1DB954] h-2 animate-bounce delay-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          <p className="text-xs text-[#B3B3B3] font-medium truncate">
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
                            style={isFav ? { fontVariationSettings: "'FILL' 1", color: '#1DB954' } : {}}
                          >
                            {isFav ? 'favorite' : 'favorite_border'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) togglePlay();
                              else playTrack(track, searchResults);
                            }}
                            className="material-symbols-outlined text-[#1DB954] hover:text-[#1ED760] hover:scale-110 transition-transform p-2"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {isSelected && isPlaying ? 'pause_circle' : 'play_circle'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-[#B3B3B3]">
                  <span className="material-symbols-outlined text-4xl mb-2 text-[#1DB954]">search_off</span>
                  <p className="text-sm font-semibold">No dynamic matches found for "{searchValue}"</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* STANDARD BROWSE CATEGORIES & DYNAMIC TRENDING PICKS */
          <div className="space-y-10 animate-fadeIn">
            {/* Recent Searches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Searches</h2>
                <button
                  onClick={() => setSearchValue('')}
                  className="text-[#1DB954] text-xs font-bold hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {['Kesariya', 'Arijit Singh', 'Bollywood Hits', 'Pasoori'].map(
                  (term, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCategoryClick(term)}
                      className="flex-none px-4 py-2 rounded-full bg-[#282828] border border-[#3E3E3E] flex items-center gap-2 hover:border-[#1DB954] transition-colors cursor-pointer text-white shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm text-[#1DB954]">
                        history
                      </span>
                      <span className="text-sm font-semibold">{term}</span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Browse All Categories */}
            <section>
              <h2 className="text-xl font-bold text-white mb-6">
                Browse Dynamic Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.title)}
                    className="relative overflow-hidden rounded-2xl aspect-square shadow-xl group cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                    style={{
                      background: `linear-gradient(135deg, ${cat.colorFrom}, ${cat.colorTo})`,
                    }}
                  >
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                      <span className="text-xl font-extrabold" style={{ color: cat.textColor }}>
                        {cat.title}
                      </span>
                      <div className="self-end translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-70">
                        <span
                          className="material-symbols-outlined text-5xl"
                          style={{ color: cat.textColor, fontVariationSettings: "'FILL' 1" }}
                        >
                          {cat.icon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Live Dynamic Trending Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  Live Dynamic Picks
                </h2>
                {isLoadingTrending && (
                  <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
                    progress_activity
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {(trendingPicks.length > 0 ? trendingPicks : queue).slice(0, 5).map((track) => {
                  const isSelected = track.id === currentTrack.id;
                  const isFav = favorites.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        playTrack(track, trendingPicks.length > 0 ? trendingPicks : queue);
                        onNavigate('player', 'slide_up');
                      }}
                      className={`flex items-center gap-4 p-3.5 bg-[#181818] border border-[#282828] rounded-2xl hover:bg-[#282828] active:bg-[#282828] transition-all cursor-pointer group ${
                        isSelected ? 'border-[#1DB954] bg-[#282828]' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm relative">
                        <img className="w-full h-full object-cover" alt={track.title} src={track.coverUrl} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.title}
                        </h4>
                        <p className="text-xs text-[#B3B3B3] font-medium truncate">
                          {track.artist}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) togglePlay();
                          else playTrack(track, trendingPicks.length > 0 ? trendingPicks : queue);
                        }}
                        className="material-symbols-outlined text-[#1DB954] hover:text-[#1ED760] hover:scale-110 transition-transform p-2"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isSelected && isPlaying ? 'pause_circle' : 'play_circle'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Mini Player */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[600px] z-40">
        <div
          onClick={() => onNavigate('player', 'slide_up')}
          className="bg-[#282828] rounded-2xl px-4 py-3 shadow-2xl border border-[#3E3E3E] flex items-center gap-4 cursor-pointer relative"
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
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#B3B3B3] font-medium truncate">
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-full shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={nextTrack}
              className="material-symbols-outlined text-[#B3B3B3] hover:text-white"
            >
              skip_next
            </button>
          </div>

          <div className="absolute bottom-0 left-4 right-4 h-1 bg-[#535353] rounded-full overflow-hidden">
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

      <BottomNav currentScreen="search" onNavigate={onNavigate} />
    </div>
  );
};
