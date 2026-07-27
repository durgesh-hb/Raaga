import { Track, Playlist, SearchCategory } from './types';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 268,
    genre: 'Bollywood',
    isFavorite: true,
    lyrics: `[00:05.00] Mujhko kitna pyaar hai tumse
[00:15.00] Kesariya tera ishq hai piya
[00:25.00] Rang jaaun jo main haath lagaun
[00:35.00] Din beete saare teri fikr mein
[00:50.00] Rain saari teri khair manaun
[01:10.00] O kesariya tera ishq hai piya`,
  },
  {
    id: '2',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao',
    album: 'Jawan',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 200,
    genre: 'Bollywood',
    isFavorite: true,
    lyrics: `[00:10.00] Ishq mein dil bana hai chaleya
[00:22.00] Teri or khincha chala gaya
[00:38.00] Tu hi hai manzil meri
[00:52.00] Dil jawan ho gaya`,
  },
  {
    id: '3',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh, Mithoon',
    album: 'Aashiqui 2',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 262,
    genre: 'Bollywood',
    isFavorite: true,
    lyrics: `[00:08.00] Hum tere bin ab reh nahi sakte
[00:12.00] Tere bina kya wajood mera
[00:18.00] Kyunki tum hi ho, ab tum hi ho
[00:23.00] Zindagi ab tum hi ho
[00:30.00] Chain bhi, mera dard bhi
[00:38.00] Meri aashiqui ab tum hi ho`,
  },
  {
    id: '4',
    title: 'Raataan Lambiyan',
    artist: 'Jubin Nautiyal, Asees Kaur',
    album: 'Shershaah',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 230,
    genre: 'Bollywood',
    isFavorite: false,
    lyrics: `[00:06.00] Teri meri baaton ko koi na jaane
[00:10.00] Raataan lambiyan lambiyan re
[00:14.00] Kate tere sang tere sang re
[00:18.00] Bol diya maine tumse dil ki baat`,
  },
  {
    id: '5',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 261,
    genre: 'Bollywood',
    isFavorite: true,
    lyrics: `[00:08.00] Tu mera koi na hoke bhi kuch lage
[00:12.00] Apna bana le mujhe, apna bana le
[00:16.00] Dil ke samandar mein tu le chal mujhe`,
  },
  {
    id: '6',
    title: 'Jai Ho',
    artist: 'A.R. Rahman, Sukhwinder Singh',
    album: 'Slumdog Millionaire',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 319,
    genre: 'Indian Pop',
    isFavorite: false,
    lyrics: `[00:04.00] Jai Ho! Jai Ho!
[00:08.00] Aaja aaja jind shamiyane ke tale
[00:12.00] Aaja zari wale nile aasmaan ke tale
[00:16.00] Jai Ho!`,
  },
  {
    id: '7',
    title: 'Heeriye',
    artist: 'Jasleen Royal, Arijit Singh',
    album: 'Single',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 194,
    genre: 'Indie India',
    isFavorite: true,
    lyrics: `[00:05.00] Heeriye aa, Heeriye aa
[00:12.00] Teri yaad silent raaton mein aaye
[00:20.00] Dil ko har pal tadpaye`,
  },
  {
    id: '8',
    title: 'Pasoori',
    artist: 'Ali Sethi, Shae Gill',
    album: 'Coke Studio',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 224,
    genre: 'Punjabi',
    isFavorite: false,
    lyrics: `[00:06.00] Agg lavan majboori nu
[00:10.00] Aan jaan di pasoori nu
[00:15.00] Zehar bane haan teri yaadon mein`,
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'Bollywood Hits 2026',
    type: 'Playlist',
    songCount: 85,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'p2',
    title: 'Arijit Singh Melodies',
    type: 'Playlist',
    songCount: 110,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'p3',
    title: 'A.R. Rahman Magic',
    type: 'Playlist',
    songCount: 95,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60',
  },
];

export const CATEGORIES: SearchCategory[] = [
  { id: 'c1', title: 'Bollywood', icon: 'movie', colorFrom: '#E0F2FE', colorTo: '#BAE6FD', textColor: '#0369A1' },
  { id: 'c2', title: 'Punjabi Hits', icon: 'music_note', colorFrom: '#F0F9FF', colorTo: '#D1FAE5', textColor: '#065F46' },
  { id: 'c3', title: 'Indian Classical', icon: 'graphic_eq', colorFrom: '#FEF3C7', colorTo: '#FDE68A', textColor: '#92400E' },
  { id: 'c4', title: 'Indie India', icon: 'cloud_queue', colorFrom: '#EDE9FE', colorTo: '#DDD6FE', textColor: '#5B21B6' },
  { id: 'c5', title: 'Sufi & Devotional', icon: 'favorite', colorFrom: '#FFEDD5', colorTo: '#FED7AA', textColor: '#9A3412' },
  { id: 'c6', title: 'South Hits', icon: 'podcasts', colorFrom: '#FCE7F3', colorTo: '#FBCFE8', textColor: '#9D174D' },
  { id: 'c7', title: 'Lofi Chill India', icon: 'nightlight', colorFrom: '#CFFAFE', colorTo: '#A5F3FC', textColor: '#0E7490' },
  { id: 'c8', title: 'Retro Classics', icon: 'album', colorFrom: '#F5F3FF', colorTo: '#EDE9FE', textColor: '#4C1D95' },
];

export const IMAGINE_DRAGONS_ARTIST = {
  name: 'Arijit Singh',
  listeners: 'Over 85M monthly listeners. Iconic Indian playback singer & composer.',
  imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
};

export const USER_PROFILE = {
  name: 'Alex Rivers',
  email: 'alex@email.com',
  isPremium: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
};
