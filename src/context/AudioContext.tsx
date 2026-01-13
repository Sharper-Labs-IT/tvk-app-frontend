import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Single background music track
const musicTrack = '/music/jana_nayagan.mp3';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false); // Start unmuted for autoplay
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(musicTrack);
    audio.volume = 0.5; // Set default volume to 50%
    audio.loop = true; // Loop the single track
    audioRef.current = audio;

    // Attempt to autoplay
    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch (error) {
        // Autoplay blocked - user will need to click the button
        console.log('Autoplay blocked. User interaction required.');
        setIsMuted(true);
        audio.muted = true;
      }
    };

    attemptAutoplay();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
