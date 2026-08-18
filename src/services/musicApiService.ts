import { SongDTO, Track } from '../types';
import { Capacitor } from '@capacitor/core';

export const DEFAULT_LIVE_BACKEND_URL = 'https://raaga-backend-deployment-bwu1.onrender.com';

/**
 * Backend Base URL resolution:
 * Enforces live Render Spring Boot backend URL by default across all platforms.
 */
export const getApiBaseUrl = (): string => {
  const metaEnv = (
    import.meta as unknown as {
      env?: Record<string, string>;
    }
  ).env;

  // Allow explicit override via environment variables
  if (metaEnv?.VITE_API_BASE_URL) {
    return metaEnv.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  if (metaEnv?.API_BASE_URL) {
    return metaEnv.API_BASE_URL.replace(/\/$/, '');
  }

  // Deployed Render backend default for Web & Mobile Native (Android/iOS)
  return DEFAULT_LIVE_BACKEND_URL;
};

export let API_BASE_URL = getApiBaseUrl();

/**
 * Resolves audio stream URLs returned from search endpoints (/api/v1/music/search).
 * Ensures secure HTTPS protocol so audio engines stream directly without protocol downgrade.
 */
export const resolveAudioStreamUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) return '';
  let url = rawUrl.trim();

  // Upgrade http:// to https:// for secure audio streaming
  if (url.startsWith('http://')) {
    url = url.replace(/^http:\/\//i, 'https://');
  }

  return url;
};

/**
 * Convert Spring Boot SongDTO -> Frontend Track
 */
export const mapSongDtoToTrack = (dto: SongDTO): Track => {
  const rawAudioUrl = dto.streamUrl || dto.audioUrl || '';
  return {
    id: dto.id || String(Math.random()),
    title: dto.name || dto.title || 'Untitled Track',
    artist: dto.artist || 'Unknown Artist',
    album: dto.album || (dto.language ? `${dto.language} Album` : 'Single'),
    coverUrl:
      dto.artworkUrl ||
      dto.imageUrl ||
      (dto as any).artwork ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    audioUrl: resolveAudioStreamUrl(rawAudioUrl),
    duration: dto.duration || 180,
    genre: dto.language || 'Music',
    isFavorite: false,
  };
};

/**
 * Fetch helper with cold-start timeout handling (45s timeout for Render free-tier container spin-up)
 */
export const fetchWithColdStartTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 45000
): Promise<Response> => {
  const controller = new AbortController();
  const { signal: externalSignal, ...restOptions } = options;

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort();
      clearTimeout(timeoutId);
    });
  }

  try {
    const response = await fetch(url, { ...restOptions, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Render backend is spinning up from cold start. Please retry in a few seconds.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Java Spring Boot API Service
 */
export class MusicApiService {

  /**
   * Search songs
   *
   * GET /api/v1/music/search?q={query}
   */
  static async searchSongs(
    query: string,
    signal?: AbortSignal
  ): Promise<Track[]> {
    if (!query || !query.trim()) {
      return [];
    }

    const cleanQuery = encodeURIComponent(query.trim());
    const url = `${API_BASE_URL}/api/v1/music/search?q=${cleanQuery}`;

    console.log('[MusicApiService] Searching live Render endpoint:', url);

    try {
      const response = await fetchWithColdStartTimeout(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      }, 45000);

      if (!response.ok) {
        throw new Error(`Java API HTTP ${response.status}: ${response.statusText}`);
      }

      const dtos: SongDTO[] = await response.json();

      if (!Array.isArray(dtos)) {
        console.warn('[MusicApiService] Unexpected response format:', dtos);
        return [];
      }

      return dtos.map(mapSongDtoToTrack);
    } catch (error: any) {
      console.error('[MusicApiService] Search failed on live Render backend:', error);
      throw error;
    }
  }

  /**
   * Get one song by ID
   *
   * GET /api/v1/music/track/{id}
   */
  static async getSongById(
    id: string,
    signal?: AbortSignal
  ): Promise<Track | null> {
    const url = `${API_BASE_URL}/api/v1/music/track/${encodeURIComponent(id)}`;

    try {
      const response = await fetchWithColdStartTimeout(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      }, 30000);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Java API HTTP ${response.status}`);
      }

      const dto: SongDTO = await response.json();
      return mapSongDtoToTrack(dto);
    } catch (error) {
      console.error(`[MusicApiService] Failed to fetch track ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check Spring Boot backend health
   *
   * GET /api/music/test
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/music/test`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }, 15000);

      if (response.ok) return true;
    } catch (error) {
      console.warn(`[MusicApiService] Live backend at ${API_BASE_URL} unreachable:`, error);
    }

    if (API_BASE_URL !== DEFAULT_LIVE_BACKEND_URL) {
      try {
        console.log(`[MusicApiService] Attempting fallback check to ${DEFAULT_LIVE_BACKEND_URL}...`);
        const response = await fetchWithColdStartTimeout(`${DEFAULT_LIVE_BACKEND_URL}/api/music/test`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }, 15000);
        if (response.ok) {
          API_BASE_URL = DEFAULT_LIVE_BACKEND_URL;
          console.log(`[MusicApiService] Switched API_BASE_URL to ${DEFAULT_LIVE_BACKEND_URL}`);
          return true;
        }
      } catch (fallbackErr) {
        console.warn('[MusicApiService] Fallback backend unreachable:', fallbackErr);
      }
    }

    return false;
  }

  /**
   * Check Supabase PostgreSQL Database connectivity via Java Spring Boot
   *
   * GET /api/music/db-check
   */
  static async checkDb(): Promise<string> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/music/db-check`, {
        method: 'GET',
        headers: { Accept: 'text/plain, application/json' },
      }, 20000);
      return await response.text();
    } catch (error: any) {
      return `❌ Database check failed: ${error?.message || 'Unreachable'}`;
    }
  }

  /**
   * Fetch Google OAuth consent URL from Java Spring Boot Auth service
   *
   * GET /api/auth/google/url
   */
  static async getGoogleAuthUrl(redirectUri?: string): Promise<string | null> {
    try {
      const uriParam = redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : '';
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/auth/google/url${uriParam}`, {
        method: 'GET',
      }, 15000);
      if (!response.ok) return null;
      const data = await response.json();
      return data?.url || null;
    } catch (e) {
      console.warn('[MusicApiService] Failed to fetch Google Auth URL:', e);
      return null;
    }
  }

  /**
   * Get user liked songs from Supabase PostgreSQL
   * GET /api/library/liked-songs
   */
  static async getLikedSongs(userId = 'user_default'): Promise<Track[]> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/library/liked-songs?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
      }, 20000);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.trackId || item.id,
        title: item.title || 'Untitled Track',
        artist: item.artist || 'Unknown Artist',
        album: 'Liked Songs',
        coverUrl: item.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
        audioUrl: resolveAudioStreamUrl(item.streamUrl || ''),
        duration: item.duration || 180,
        genre: 'Music',
        isFavorite: true,
      }));
    } catch (e) {
      console.warn('[MusicApiService] Failed to fetch liked songs from Supabase:', e);
      return [];
    }
  }

  /**
   * Toggle liked song in Supabase PostgreSQL
   * POST /api/library/liked-songs
   */
  static async toggleLikedSong(track: Track, userId = 'user_default'): Promise<boolean> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/library/liked-songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          artworkUrl: track.coverUrl,
          streamUrl: resolveAudioStreamUrl(track.audioUrl),
          duration: track.duration,
        }),
      }, 15000);
      return response.ok;
    } catch (e) {
      console.warn('[MusicApiService] Failed to toggle liked song in Supabase:', e);
      return false;
    }
  }

  /**
   * Fetch user playlists from Supabase PostgreSQL
   * GET /api/library/playlists
   */
  static async getPlaylists(userId = 'user_default'): Promise<any[]> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/library/playlists?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
      }, 15000);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.warn('[MusicApiService] Failed to fetch playlists from Supabase:', e);
      return [];
    }
  }

  /**
   * Create playlist in Supabase PostgreSQL
   * POST /api/library/playlists
   */
  static async createPlaylist(title: string, description?: string, userId = 'user_default'): Promise<any | null> {
    try {
      const response = await fetchWithColdStartTimeout(`${API_BASE_URL}/api/library/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          description: description || '',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
        }),
      }, 15000);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('[MusicApiService] Failed to create playlist in Supabase:', e);
      return null;
    }
  }
}

/**
 * Debounce helper
 */
export function debounce<
  T extends (...args: any[]) => void
>(
  func: T,
  waitMs: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(
      () => func(...args),
      waitMs
    );
  };
}