import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, TransitionType, Track } from '../types';
import { BottomNav } from './Navigation';
import { IMAGINE_DRAGONS_ARTIST, TRACKS, USER_PROFILE } from '../data';
import { MusicApiService } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';

interface SearchResultsScreenProps {
  initialSearchQuery?: string;
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  initialSearchQuery = 'Imagine Dragons',
  onNavigate,
}) => {
  const { currentTrack, isPlaying, isBuffering, playTrack, togglePlay, nextTrack, favorites, toggleFavorite, addToQueue, networkError } = useAudio();

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const executeSearch = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setSearchResults(TRACKS);
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
        // Fallback filter
        const queryLower = query.toLowerCase();
        const filtered = TRACKS.filter(
          (t) =>
            t.title.toLowerCase().includes(queryLower) ||
            t.artist.toLowerCase().includes(queryLower) ||
            (t.genre && t.genre.toLowerCase().includes(queryLower))
        );
        setSearchResults(filtered.length > 0 ? filtered : TRACKS);
      }
    } catch (err: any) {
      console.warn('Java API search error, using local dataset fallback', err);
      setApiError('Java backend disconnected. Showing offline catalog.');
      const queryLower = query.toLowerCase();
      const filtered = TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(queryLower) ||
          t.artist.toLowerCase().includes(queryLower)
      );
      setSearchResults(filtered.length > 0 ? filtered : TRACKS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, executeSearch]);

  const isCurrentFavorite = favorites.includes(currentTrack.id);

  return (
    <div className="bg-[#121212] min-h-screen text-white pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 w-full bg-[#121212]/90 backdrop-blur-xl z-40 shadow-md flex justify-between items-center px-4 md:px-10 h-16 border-b border-[#282828]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center overflow-hidden border border-[#282828]">
            <img
              className="w-full h-full object-cover"
              alt="User"
              src={USER_PROFILE.avatarUrl}
            />
          </div>
          <h1
            onClick={() => onNavigate('home', 'none')}
            className="text-xl font-extrabold text-white cursor-pointer hover:text-[#1DB954]"
          >
            RAAGA Stream
          </h1>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]">
              search
            </span>
            <input
              className="w-full bg-[#282828] border border-transparent rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-[#B3B3B3] focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] transition-all outline-none"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search artists, songs..."
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
                  progress_activity
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onNavigate('settings', 'push')}
          className="text-[#B3B3B3] hover:text-white hover:bg-[#282828] transition-colors p-2 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-10 pb-20 pt-6">
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B3B3B3]">
              search
            </span>
            <input
              className="w-full h-12 bg-[#282828] rounded-xl pl-12 pr-10 text-sm border border-transparent text-white placeholder-[#B3B3B3] focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] shadow-sm outline-none"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs or artists..."
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
                  progress_activity
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Network State Banners */}
        {apiError && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">wifi_off</span>
              <span className="text-sm font-medium">{apiError}</span>
            </div>
            <button
              onClick={() => executeSearch(searchTerm)}
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

        {/* Top Result Banner */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Top Result
          </h2>
          <div className="bg-[#181818] border border-[#282828] shadow-2xl rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl flex-shrink-0 border-4 border-[#282828]">
              <img
                className="w-full h-full object-cover"
                alt={IMAGINE_DRAGONS_ARTIST.name}
                src={IMAGINE_DRAGONS_ARTIST.imageUrl}
              />
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center h-full">
              <span className="inline-block px-4 py-1 bg-[#1DB954]/15 text-[#1DB954] rounded-full text-xs font-bold mb-3 uppercase tracking-widest">
                VERIFIED ARTIST
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-3 text-white">
                {IMAGINE_DRAGONS_ARTIST.name}
              </h3>
              <p className="text-sm md:text-base text-[#B3B3B3] mb-6 max-w-lg">
                {IMAGINE_DRAGONS_ARTIST.listeners}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (searchResults.length > 0) {
                      playTrack(searchResults[0], searchResults);
                      onNavigate('player', 'slide_up');
                    }
                  }}
                  className="bg-[#1DB954] hover:bg-[#1ED760] text-black px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Play Top Song
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Songs List */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Tracks ({searchResults.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col justify-center items-center text-[#1DB954]">
              <span className="material-symbols-outlined text-4xl animate-spin mb-2">
                progress_activity
              </span>
              <span className="text-sm font-semibold">Searching catalog...</span>
            </div>
          ) : (
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
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-[#282828] border border-[#1DB954]/40 font-bold'
                        : 'bg-[#181818] border border-[#282828] hover:bg-[#282828] active:bg-[#282828]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm relative">
                      <img
                        className="w-full h-full object-cover"
                        alt={track.title}
                        src={track.coverUrl}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-[#1DB954]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-bold truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-[#B3B3B3] font-medium truncate">
                        {track.artist} • {track.album}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                        className="material-symbols-outlined text-[#B3B3B3] hover:text-white transition-colors p-2"
                        title="Add to Queue"
                      >
                        playlist_add
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Persistent Mini Player */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl bg-[#282828] border border-[#3E3E3E] shadow-2xl rounded-2xl p-3 z-40 flex items-center gap-4 cursor-pointer">
        <div
          onClick={() => onNavigate('player', 'slide_up')}
          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative"
        >
          <img
            className="w-full h-full object-cover"
            alt={currentTrack.title}
            src={currentTrack.coverUrl}
          />
          {isBuffering && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1DB954] animate-spin text-sm">
                progress_activity
              </span>
            </div>
          )}
        </div>
        <div
          onClick={() => onNavigate('player', 'slide_up')}
          className="flex-1 min-w-0"
        >
          <h5 className="text-sm text-white font-bold truncate">
            {currentTrack.title}
          </h5>
          <p className="text-xs text-[#B3B3B3] font-semibold truncate">
            {currentTrack.artist}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="material-symbols-outlined p-2 text-[#1DB954] hover:text-[#1ED760] hover:scale-110 transition-all cursor-pointer"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </button>
          <button
            onClick={nextTrack}
            className="material-symbols-outlined p-2 text-white hover:text-[#1DB954] transition-colors"
          >
            skip_next
          </button>
        </div>
      </div>

      <BottomNav currentScreen="results" onNavigate={onNavigate} />
    </div>
  );
};
