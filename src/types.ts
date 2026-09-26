export type ScreenType =
  | 'login'
  | 'home'
  | 'search'
  | 'results'
  | 'player'
  | 'library'
  | 'settings';

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

export interface SongDTO {
  id: string;
  name?: string;
  title?: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  artworkUrl?: string;
  audioUrl?: string;
  streamUrl?: string;
  duration: number;
  language?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // seconds
  genre?: string;
  language?: string;
  isFavorite?: boolean;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  cover_url?: string;
  coverUrl?: string;
  type?: string;
  songCount?: number;
  tracks?: Track[];
  created_at?: string;
}

export interface PlaylistTrack {
  id?: string;
  playlist_id: string;
  track_id: string;
  title: string;
  artist: string;
  artwork_url?: string;
  stream_url?: string;
  duration?: number;
  created_at?: string;
}

export interface SearchCategory {
  id: string;
  title: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
}

export interface UserProfile {
  name: string;
  email: string;
  isPremium: boolean;
  avatarUrl: string;
}

// =====================================================
// RECOMMENDATION SYSTEM TYPES
// =====================================================

export interface UserPreference {
  id?: string;
  userId: string;
  preferenceType: 'LANGUAGE' | 'ARTIST' | 'GENRE' | 'SONG';
  preferenceValue: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingPreferencesPayload {
  userId?: string;
  languages: string[];
  artists: string[];
  genres?: string[];
  songs?: string[];
}

export interface ListeningEventPayload {
  userId?: string;
  trackId: string;
  title?: string;
  artist?: string;
  language?: string;
  genre?: string;
  playedSeconds?: number;
  duration?: number;
  completed?: boolean;
  action: 'PLAY' | 'PLAY_30S' | 'PAUSE' | 'SKIP' | 'EARLY_SKIP' | 'COMPLETE' | 'LIKE' | 'REPLAY' | 'ADD_TO_PLAYLIST';
}

export interface RecommendationSection {
  id: string;
  title: string;
  description: string;
  sectionType: 'RECOMMENDED_FOR_YOU' | 'BECAUSE_YOU_LIKE_ARTIST' | 'POPULAR_IN_LANGUAGE' | 'RECENTLY_PLAYED' | 'DISCOVER';
  songs: SongDTO[];
}

export interface HomeRecommendationResponse {
  userId: string;
  hasPreferences: boolean;
  sections: RecommendationSection[];
}
