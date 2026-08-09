import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const SUPABASE_URL = metaEnv?.VITE_SUPABASE_URL || 'https://toxmcpcnpfapplzpztit.supabase.co';
const SUPABASE_ANON_KEY = metaEnv?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Trigger Supabase Google OAuth Redirect Flow (Web & Native Mobile App)
 */
export async function signInWithGoogleSupabase() {
  const isNative = Capacitor.isNativePlatform();
  
  // Mobile deep links (raaga://login-callback or com.ragga.stream://auth-callback) vs Web window origin
  const redirectTo = isNative 
    ? 'raaga://login-callback' 
    : `${window.location.origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[SupabaseAuth] Google OAuth Error:', error.message);
    throw error;
  }

  return data;
}

/**
 * Handle Capacitor App Deep Link for Mobile App Google OAuth Callback
 */
if (Capacitor.isNativePlatform()) {
  App.addListener('appUrlOpen', async (data) => {
    if (data.url && (data.url.includes('login-callback') || data.url.includes('auth-callback') || data.url.includes('raaga://'))) {
      try {
        const url = new URL(data.url);
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        }
      } catch (err) {
        console.warn('[SupabaseAuth] Deep link URL parse notice:', err);
      }
    }
  });
}

/**
 * Get active Supabase User Session
 */
export async function getSupabaseUserSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[SupabaseAuth] Failed to fetch session:', error.message);
    return null;
  }
  return session;
}

/**
 * 1. Send SMS OTP to phone number using Supabase Auth
 */
export async function sendPhoneOtp(phoneNumber: string) {
  const cleanPhone = phoneNumber.trim();

  // Validate E.164 phone format (+1234567890)
  if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
    throw new Error('Please enter a valid phone number with country code (e.g. +919876543210 or +12025550123).');
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: cleanPhone,
  });

  if (error) {
    console.error('[SupabaseAuth] Send OTP error:', error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * 2. Verify 6-digit SMS OTP token using Supabase Auth
 */
export async function verifyPhoneOtp(phoneNumber: string, token: string) {
  const cleanPhone = phoneNumber.trim();
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 6) {
    throw new Error('Please enter the 6-digit verification code.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: cleanPhone,
    token: cleanToken,
    type: 'sms',
  });

  if (error) {
    console.error('[SupabaseAuth] Verify OTP error:', error.message);
    throw new Error(error.message);
  }

  if (data?.user) {
    await upsertUserProfile(data.user);
  }

  return data;
}

/**
 * 3. Sync User Profile in public.profiles table matching auth.users.id
 */
export async function upsertUserProfile(user: any) {
  if (!user || !user.id) return;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.phone || user.email || 'Raaga Listener';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || null,
        full_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('[SupabaseAuth] Profile sync warning:', error.message);
    }
  } catch (err) {
    console.warn('[SupabaseAuth] Profile sync caught error:', err);
  }
}

/**
 * Clean Sign Out - Sign out of Supabase & clear local storage tokens/cache to reset application state
 */
export async function signOutCleanSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[SupabaseAuth] Sign out notice:', err);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('[SupabaseAuth] Local storage clear error:', e);
    }
  }
}

/**
 * 4. Create new Playlist in Supabase 'playlists' table
 */
export async function createPlaylistSupabase(title: string, description: string = '') {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'user_default';
  const coverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60';

  const { data, error } = await supabase
    .from('playlists')
    .insert([
      {
        user_id: userId,
        title,
        description,
        cover_url: coverUrl,
      },
    ])
    .select();

  if (error) {
    console.warn('[SupabaseDB] Insert playlist error (falling back locally):', error.message);
    return {
      id: 'pl_' + Date.now(),
      user_id: userId,
      title,
      description,
      cover_url: coverUrl,
      created_at: new Date().toISOString(),
    };
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * 5. Fetch all Playlists for current user from Supabase
 */
export async function fetchPlaylistsSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'user_default';

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .or(`user_id.eq.${userId},user_id.eq.user_default`)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[SupabaseDB] Fetch playlists error:', error.message);
    return [];
  }

  return data || [];
}

/**
 * 6. Delete Entire Playlist from Supabase 'playlists' & 'playlist_tracks' tables
 */
export async function deletePlaylistSupabase(playlistId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // 1. Delete linked tracks
  await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId);

  // 2. Delete playlist entity matching user_id
  const query = supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (userId) {
    query.eq('user_id', userId);
  }

  const { error } = await query;
  if (error) {
    console.warn('[SupabaseDB] Delete playlist error:', error.message);
    throw new Error(error.message);
  }

  return true;
}

/**
 * 7. Add a Song Track to a Playlist in Supabase 'playlist_tracks' table
 */
export async function addTrackToPlaylistSupabase(playlistId: string, track: any) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert([
      {
        playlist_id: playlistId,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        artwork_url: track.coverUrl || track.artworkUrl || track.imageUrl || '',
        duration: track.duration || 180,
        stream_url: track.audioUrl || track.streamUrl || '',
      },
    ])
    .select();

  if (error) {
    console.warn('[SupabaseDB] Add track to playlist error:', error.message);
    throw new Error(error.message);
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * 8. Remove a Song Track from a Playlist in Supabase 'playlist_tracks' table
 */
export async function removeTrackFromPlaylistSupabase(playlistId: string, trackId: string) {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);

  if (error) {
    console.warn('[SupabaseDB] Remove track from playlist error:', error.message);
    throw new Error(error.message);
  }

  return true;
}

/**
 * 9. Dynamically fetch Saved Songs for a Playlist ID from 'playlist_tracks'
 */
export async function fetchPlaylistTracksSupabase(playlistId: string) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[SupabaseDB] Fetch playlist tracks error:', error.message);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.track_id || item.id,
    title: item.title || 'Untitled Track',
    artist: item.artist || 'Unknown Artist',
    album: 'Playlist Track',
    coverUrl: item.artwork_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    audioUrl: item.stream_url || '',
    duration: item.duration || 180,
    genre: 'Music',
    isFavorite: true,
  }));
}
