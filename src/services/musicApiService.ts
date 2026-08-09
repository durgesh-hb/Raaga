import { SongDTO, Track } from '../types';
import { Capacitor } from '@capacitor/core';

/**
 * Backend URL resolution:
 *
 * Android app:
 *   Uses the deployed Spring Boot backend on Render.
 *
 * Web development:
 *   Can use VITE_API_BASE_URL if configured.
 *   Otherwise falls back to localhost:8080.
 */
export const getApiBaseUrl = (): string => {
  const metaEnv = (
    import.meta as unknown as {
      env?: Record<string, string>;
    }
  ).env;

  // Allow explicit override via environment variable
  if (metaEnv?.VITE_API_BASE_URL) {
    return metaEnv.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  // Android APK -> deployed Spring Boot backend
  if (
    Capacitor.isNativePlatform() &&
    Capacitor.getPlatform() === 'android'
  ) {
    return 'https://raaga-backend-deployment.onrender.com';
  }

  // Local web development -> default to local Spring Boot (http://localhost:8080) if on localhost
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:8080';
  }

  // Deployed production fallback
  return 'https://raaga-backend-deployment.onrender.com';
};

export let API_BASE_URL = getApiBaseUrl();

/**
 * Convert Spring Boot SongDTO -> Frontend Track
 */
export const mapSongDtoToTrack = (dto: SongDTO): Track => {
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

    audioUrl: dto.streamUrl || dto.audioUrl || '',

    duration: dto.duration || 180,

    genre: dto.language || 'Music',

    isFavorite: false,
  };
};

/**
 * Java Spring Boot API Service
 */
export class MusicApiService {

  /**
   * Search songs
   *
   * GET /api/v1/music/search?q=Kesariya
   */
  static async searchSongs(
    query: string,
    signal?: AbortSignal
  ): Promise<Track[]> {

    if (!query || !query.trim()) {
      return [];
    }

    const cleanQuery = encodeURIComponent(query.trim());

    const url =
      `${API_BASE_URL}/api/v1/music/search?q=${cleanQuery}`;

    console.log(
      '[MusicApiService] Searching:',
      url
    );

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Java API HTTP ${response.status}`
        );
      }

      const dtos: SongDTO[] =
        await response.json();

      if (!Array.isArray(dtos)) {
        console.warn(
          '[MusicApiService] Unexpected response:',
          dtos
        );

        return [];
      }

      return dtos.map(mapSongDtoToTrack);

    } catch (error) {

      console.error(
        '[MusicApiService] Search failed:',
        error
      );

      throw new Error(
        'Unable to connect to Java Spring Boot Backend.'
      );
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

    const url =
      `${API_BASE_URL}/api/v1/music/track/${encodeURIComponent(id)}`;

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(
          `Java API HTTP ${response.status}`
        );
      }

      const dto: SongDTO =
        await response.json();

      return mapSongDtoToTrack(dto);

    } catch (error) {

      console.error(
        `[MusicApiService] Failed to fetch track ${id}:`,
        error
      );

      throw error;
    }
  }

  /**
   * Check Spring Boot backend health (with automatic fallback from localhost to Render if local is offline)
   *
   * GET /api/music/test
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/music/test`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) return true;
    } catch (error) {
      console.warn(
        `[MusicApiService] Backend at ${API_BASE_URL} unreachable:`,
        error
      );
    }

    // Fallback: If local backend was tried and failed, attempt production Render backend
    if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
      const fallbackUrl = 'https://raaga-backend-deployment.onrender.com';
      try {
        console.log(`[MusicApiService] Attempting fallback to ${fallbackUrl}...`);
        const response = await fetch(`${fallbackUrl}/api/music/test`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          API_BASE_URL = fallbackUrl;
          console.log(`[MusicApiService] Switched API_BASE_URL to ${fallbackUrl}`);
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
      const response = await fetch(`${API_BASE_URL}/api/music/db-check`, {
        method: 'GET',
        headers: { Accept: 'text/plain, application/json' },
      });
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
      const response = await fetch(`${API_BASE_URL}/api/auth/google/url${uriParam}`);
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
      const response = await fetch(`${API_BASE_URL}/api/library/liked-songs?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.trackId || item.id,
        title: item.title || 'Untitled Track',
        artist: item.artist || 'Unknown Artist',
        album: 'Liked Songs',
        coverUrl: item.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
        audioUrl: item.streamUrl || '',
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
      const response = await fetch(`${API_BASE_URL}/api/library/liked-songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          artworkUrl: track.coverUrl,
          streamUrl: track.audioUrl,
          duration: track.duration,
        }),
      });
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
      const response = await fetch(`${API_BASE_URL}/api/library/playlists?userId=${encodeURIComponent(userId)}`);
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
      const response = await fetch(`${API_BASE_URL}/api/library/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          description: description || '',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
        }),
      });
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

  let timeout:
    ReturnType<typeof setTimeout> | null =
    null;

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