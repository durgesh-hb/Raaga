import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../types';
import { TRACKS } from '../data';
import { MusicApiService, resolveAudioStreamUrl } from '../services/musicApiService';

interface AudioContextType {
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  favorites: string[];
  networkError: string | null;
  playbackSpeed: number;
  toastMessage: string | null;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (timeInSeconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleFavorite: (trackId: string) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearError: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setPlaybackSpeed: (speed: number) => void;
  showToast: (msg: string) => void;
  loadDynamicQueue: (query: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(TRACKS[0].duration || 225);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '2', '4', '6']);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic initial queue fetch from Spring Boot backend API
  useEffect(() => {
    let isMounted = true;
    MusicApiService.searchSongs('Top Hindi Songs')
      .then((fetched) => {
        if (isMounted && fetched && fetched.length > 0) {
          setQueue(fetched);
          setCurrentTrack(fetched[0]);
          setDuration(fetched[0].duration || 180);
        }
      })
      .catch((err) => {
        console.warn('[AudioContext] Dynamic queue fetch error, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Initialize Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    const handleLoadStart = () => {
      setIsBuffering(true);
      setNetworkError(null);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
      setPosition(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        handleNextTrackRef.current();
      }
    };

    const handleError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
      const errMsg = audio.error
        ? `Audio stream error (code ${audio.error.code}). Check server connection.`
        : 'Failed to stream audio track.';
      setNetworkError(errMsg);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const handleNextTrackRef = useRef<() => void>(() => {});

  const nextTrack = () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    const nextTrk = queue[nextIndex] || TRACKS[0];
    playTrack(nextTrk);
  };

  handleNextTrackRef.current = nextTrack;

  const prevTrack = () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevTrk = queue[prevIndex] || TRACKS[0];
    playTrack(prevTrk);
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }

    const resolvedStreamUrl = resolveAudioStreamUrl(track.audioUrl);
    const updatedTrack = { ...track, audioUrl: resolvedStreamUrl };

    setCurrentTrack(updatedTrack);
    setNetworkError(null);
    setIsBuffering(true);
    setPosition(0);
    setDuration(track.duration || 180);

    if (audioRef.current) {
      audioRef.current.src = resolvedStreamUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn('Audio play request failed:', err);
          setIsBuffering(false);
          setIsPlaying(false);
          setNetworkError('Unable to stream track. Render backend container may be warming up from cold start.');
          showToast('Server warming up... Please retry in a moment.');
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setNetworkError(null);
      const streamUrl = resolveAudioStreamUrl(currentTrack.audioUrl);
      if (!audioRef.current.src || audioRef.current.src === window.location.href || audioRef.current.src !== streamUrl) {
        audioRef.current.src = streamUrl;
      }
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback resume failed:', err);
          setNetworkError('Connecting to live audio stream from Render...');
          showToast('Connecting to stream...');
        });
    }
  };

  const seek = (timeInSeconds: number) => {
    const validTime = Math.max(0, Math.min(timeInSeconds, duration || 9999));
    if (audioRef.current) {
      audioRef.current.currentTime = validTime;
      setPosition(validTime);
    }
  };

  const skipForward = (seconds: number = 10) => {
    seek(position + seconds);
    showToast(`Skipped +${seconds}s`);
  };

  const skipBackward = (seconds: number = 10) => {
    seek(position - seconds);
    showToast(`Rewound -${seconds}s`);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    showToast(`Speed set to ${speed}x`);
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(trackId);
      const updated = isFav ? prev.filter((id) => id !== trackId) : [...prev, trackId];
      showToast(isFav ? 'Removed from Liked Songs' : 'Added to Liked Songs');
      return updated;
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const nextVal = !prev;
      showToast(nextVal ? 'Shuffle turned ON' : 'Shuffle turned OFF');
      return nextVal;
    });
  };

  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      const nextVal = !prev;
      showToast(nextVal ? 'Repeat turned ON' : 'Repeat turned OFF');
      return nextVal;
    });
  };

  const addToQueue = (track: Track) => {
    if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [...prev, track]);
      showToast(`Added "${track.title}" to Queue`);
    } else {
      showToast(`"${track.title}" is already in Queue`);
    }
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
    showToast('Removed track from Queue');
  };

  const clearQueue = () => {
    setQueue([currentTrack]);
    showToast('Queue cleared');
  };

  const loadDynamicQueue = async (query: string) => {
    try {
      setIsBuffering(true);
      const fetched = await MusicApiService.searchSongs(query);
      if (fetched && fetched.length > 0) {
        setQueue(fetched);
        playTrack(fetched[0], fetched);
        showToast(`Loaded songs for "${query}"`);
      } else {
        showToast(`No songs found for "${query}"`);
      }
    } catch (err) {
      console.warn('[AudioContext] loadDynamicQueue error:', err);
      showToast('Backend unavailable');
    } finally {
      setIsBuffering(false);
    }
  };

  const clearError = () => setNetworkError(null);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        position,
        duration,
        volume,
        isShuffle,
        isRepeat,
        queue,
        favorites,
        networkError,
        playbackSpeed,
        toastMessage,
        playTrack,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        nextTrack,
        prevTrack,
        toggleFavorite,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        clearError,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setPlaybackSpeed,
        showToast,
        loadDynamicQueue,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] toast-animate bg-[#006591] dark:bg-[#0ea5e9] text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-lg flex items-center gap-2 border border-white/30">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
