import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Playlist of background music
const playlist = [
  '/music/jana_nayagan.mp3',
  '/music/vj.mp3'
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with current track
    const audio = new Audio(playlist[currentTrackIndex]);
    audio.volume = 0.5; // Set default volume to 50%
    audio.muted = isMuted; // Preserve mute state when switching tracks
    audioRef.current = audio;

    // Handle track ending - play next track only if not muted
    const handleTrackEnd = () => {
      if (!isMuted) {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      }
    };

    audio.addEventListener('ended', handleTrackEnd);

    // Try to play audio only if not muted
    const playAudio = async () => {
      if (!isMuted) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          // Autoplay was prevented - this is expected in many browsers
          console.log('Autoplay prevented. User interaction required.');
        }
      }
    };

    playAudio();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleTrackEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentTrackIndex, isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // Unmute
        audioRef.current.muted = false;
        if (!isPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(console.error);
        }
      } else {
        // Mute
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
