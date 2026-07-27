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

  // Allow an environment variable to override the backend URL
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

  // Local web development
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Convert Spring Boot SongDTO -> Frontend Track
 */
export const mapSongDtoToTrack = (dto: SongDTO): Track => {
  return {
    id: dto.id || String(Math.random()),

    title: dto.name || 'Untitled Track',

    artist: dto.artist || 'Unknown Artist',

    album: dto.language
      ? `${dto.language} Album`
      : 'Single',

    coverUrl:
      dto.imageUrl ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',

    audioUrl: dto.audioUrl || '',

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
   * GET /api/music/search?query=Kesariya
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
      `${API_BASE_URL}/api/music/search?query=${cleanQuery}`;

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
   * GET /api/music/song/{id}
   */
  static async getSongById(
    id: string,
    signal?: AbortSignal
  ): Promise<Track | null> {

    const url =
      `${API_BASE_URL}/api/music/song/${encodeURIComponent(id)}`;

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
   * Check Spring Boot backend
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

      return response.ok;

    } catch (error) {

      console.warn(
        '[MusicApiService] Java backend unreachable:',
        error
      );

      return false;
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