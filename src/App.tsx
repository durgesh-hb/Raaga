import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, TransitionType } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { LoginScreen } from './components/LoginScreen';
import { SearchHomeScreen } from './components/SearchHomeScreen';
import { SearchExplorerScreen } from './components/SearchExplorerScreen';
import { YourLibraryScreen } from './components/YourLibraryScreen';
import { SearchResultsScreen } from './components/SearchResultsScreen';
import { FullPlayerScreen } from './components/FullPlayerScreen';
import { SettingsScreen } from './components/SettingsScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [activeTransition, setActiveTransition] = useState<TransitionType>('push');
  const [searchQuery, setSearchQuery] = useState('Imagine Dragons');
  const { isDarkMode } = useTheme();

  const handleNavigate = (screen: ScreenType, transition: TransitionType = 'push') => {
    setActiveTransition(transition);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const getMotionVariants = (transition: TransitionType) => {
    switch (transition) {
      case 'push':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-20%', opacity: 0 },
        };
      case 'push_back':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '20%', opacity: 0 },
        };
      case 'slide_up':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 0.9 },
          animate: { opacity: 1 },
          exit: { opacity: 0.9 },
        };
    }
  };

  const variants = getMotionVariants(activeTransition);

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? 'dark' : ''
      } bg-[#f4faff] dark:bg-[#0b1319] text-[#141d21] dark:text-[#e2e8f0] overflow-x-hidden font-sans transition-colors duration-300`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="w-full min-h-screen"
        >
          {currentScreen === 'login' && <LoginScreen onNavigate={handleNavigate} />}

          {currentScreen === 'home' && (
            <SearchHomeScreen
              onNavigate={handleNavigate}
              onSearchGenre={(genre) => setSearchQuery(genre)}
            />
          )}

          {currentScreen === 'search' && (
            <SearchExplorerScreen
              initialSearchQuery={searchQuery}
              onSearchQueryChange={(query) => setSearchQuery(query)}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'library' && <YourLibraryScreen onNavigate={handleNavigate} />}

          {currentScreen === 'results' && (
            <SearchResultsScreen
              initialSearchQuery={searchQuery}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'player' && <FullPlayerScreen onNavigate={handleNavigate} />}

          {currentScreen === 'settings' && <SettingsScreen onNavigate={handleNavigate} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </ThemeProvider>
  );
}
