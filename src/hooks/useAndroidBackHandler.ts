import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

interface BackHandlerOptions {
  currentScreen: string;
  historyStackLength: number;
  onGoBack: () => void;
  onRootExit: () => void;
}

/**
 * Custom hook for handling Android hardware Back Button & gesture navigation
 * with persistent audio playback and double-tap exit prevention.
 */
export function useAndroidBackHandler({
  currentScreen,
  historyStackLength,
  onGoBack,
  onRootExit,
}: BackHandlerOptions) {
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    let backListener: any = null;

    const handleBackAction = () => {
      // 1. If on root screen (e.g., 'home' or single item in stack)
      if (historyStackLength <= 1 || currentScreen === 'home') {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          // Double-tap detected: exit or move app to background
          onRootExit();
          try {
            CapacitorApp.minimizeApp();
          } catch (err) {
            console.log('App background minimize called:', err);
          }
        } else {
          lastBackPressTime.current = now;
          onGoBack(); // Triggers double-tap exit toast notification
        }
      } else {
        // 2. Deep screen navigation: Pop current screen
        onGoBack();
      }
    };

    // Register Capacitor Native Android Back Button Listener
    const registerCapacitorListener = async () => {
      try {
        backListener = await CapacitorApp.addListener('backButton', () => {
          handleBackAction();
        });
      } catch (err) {
        // Fallback for non-Capacitor web browser environments
      }
    };

    registerCapacitorListener();

    // HTML5 PopState Listener for web/WebView back gesture sync
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleBackAction();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentScreen, historyStackLength, onGoBack, onRootExit]);
}
