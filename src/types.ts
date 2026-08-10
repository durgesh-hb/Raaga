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
  isFavorite?: boolean;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  title: string;
  type: string;
  songCount: number;
  coverUrl: string;
  tracks?: Track[];
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

