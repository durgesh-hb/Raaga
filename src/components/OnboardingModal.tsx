import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicApiService } from '../services/musicApiService';
import { useAudio } from '../context/AudioContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const LANGUAGES = [
  { id: 'Kannada', label: 'Kannada', icon: '🎵', color: 'from-amber-500 to-red-600' },
  { id: 'Hindi', label: 'Hindi', icon: '🎶', color: 'from-pink-500 to-purple-600' },
  { id: 'English', label: 'English', icon: '🎧', color: 'from-blue-500 to-indigo-600' },
  { id: 'Telugu', label: 'Telugu', icon: '🎸', color: 'from-emerald-500 to-teal-700' },
  { id: 'Tamil', label: 'Tamil', icon: '🎺', color: 'from-orange-500 to-amber-700' },
  { id: 'Punjabi', label: 'Punjabi', icon: '🪘', color: 'from-yellow-400 to-orange-600' },
  { id: 'Malayalam', label: 'Malayalam', icon: '🌴', color: 'from-green-500 to-emerald-700' },
  { id: 'Bengali', label: 'Bengali', icon: '🎼', color: 'from-violet-500 to-purple-700' },
];

const ARTISTS = [
  { id: 'Arijit Singh', name: 'Arijit Singh', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80' },
  { id: 'Anirudh Ravichander', name: 'Anirudh Ravichander', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&auto=format&fit=crop&q=80' },
  { id: 'Puneeth Rajkumar', name: 'Puneeth Rajkumar', avatar: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&auto=format&fit=crop&q=80' },
  { id: 'Sanjith Hegde', name: 'Sanjith Hegde', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80' },
  { id: 'Shreya Ghoshal', name: 'Shreya Ghoshal', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80' },
  { id: 'Sid Sriram', name: 'Sid Sriram', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80' },
  { id: 'A.R. Rahman', name: 'A.R. Rahman', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&auto=format&fit=crop&q=80' },
  { id: 'Diljit Dosanjh', name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=150&auto=format&fit=crop&q=80' },
  { id: 'Divine', name: 'Divine', avatar: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=150&auto=format&fit=crop&q=80' },
  { id: 'Taylor Swift', name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
];

const GENRES = ['Romantic', 'High Energy', 'Melody', 'Party Hits', 'Classical / Devotional', 'Hip Hop / Rap'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { userId, showToast } = useAudio();
  const [step, setStep] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Kannada', 'Hindi']);
  const [selectedArtists, setSelectedArtists] = useState<string[]>(['Arijit Singh', 'Anirudh Ravichander']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Romantic', 'Melody']);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleArtist = (artist: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artist) ? prev.filter((a) => a !== artist) : [...prev, artist]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    if (selectedLanguages.length === 0) {
      showToast('Please select at least one language');
      return;
    }

    setIsSaving(true);
    try {
      const success = await MusicApiService.saveUserPreferences({
        userId,
        languages: selectedLanguages,
        artists: selectedArtists,
        genres: selectedGenres,
      });

      if (success) {
        showToast('Music preferences saved!');
        onSaved();
        onClose();
      } else {
        showToast('Failed to save preferences. Please try again.');
      }
    } catch (err) {
      console.warn('Failed to save preferences:', err);
      showToast('Saved locally!');
      onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-[#181818] border border-[#282828] rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-[#282828]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954] text-black font-extrabold flex items-center justify-center">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Personalize Your Music</h2>
                <p className="text-xs text-[#B3B3B3]">Step {step} of 3 — Tailor your recommendations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#B3B3B3] hover:text-white p-2 rounded-full hover:bg-[#282828] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#282828] h-1.5 rounded-full my-4 overflow-hidden">
            <div
              className="bg-[#1DB954] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-none pr-1">
            {step === 1 && (
              <div>
                <h3 className="text-lg font-bold mb-2">What languages do you listen to?</h3>
                <p className="text-xs text-[#B3B3B3] mb-6">Select your favorite music languages for chart toppers and regional recommendations.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        className={`relative p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1DB954]/20 border-[#1DB954] text-white shadow-lg scale-[1.02]'
                            : 'bg-[#242424] border-transparent text-[#B3B3B3] hover:bg-[#2a2a2a] hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">{lang.icon}</span>
                        <div>
                          <p className="font-bold text-sm">{lang.label}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1DB954] text-black flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-lg font-bold mb-2">Who are your favorite artists?</h3>
                <p className="text-xs text-[#B3B3B3] mb-6">Pick artists you love to build your personalized radio and custom feeds.</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {ARTISTS.map((artist) => {
                    const isSelected = selectedArtists.includes(artist.id);
                    return (
                      <button
                        key={artist.id}
                        onClick={() => toggleArtist(artist.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1DB954]/20 border-[#1DB954] text-white scale-[1.02]'
                            : 'bg-[#242424] border-transparent text-[#B3B3B3] hover:bg-[#2a2a2a] hover:text-white'
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-full overflow-hidden mb-2 border border-[#333]">
                          <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#1DB954]/60 flex items-center justify-center text-black font-extrabold text-sm">
                              ✓
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold line-clamp-2">{artist.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-lg font-bold mb-2">Select your favorite music vibes</h3>
                <p className="text-xs text-[#B3B3B3] mb-6">Choose genres and moods for discovery recommendations.</p>
                <div className="flex flex-wrap gap-3">
                  {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-5 py-3 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1DB954] border-[#1DB954] text-black shadow-md'
                            : 'bg-[#242424] border-[#333] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-[#282828] mt-2">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-full bg-[#282828] hover:bg-[#333] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-sm transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-sm transition-transform active:scale-95 cursor-pointer shadow-lg flex items-center gap-2"
              >
                {isSaving && <span className="animate-spin text-sm">⏳</span>}
                Save & Generate Recommendations
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
