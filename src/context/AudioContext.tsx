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
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayAttempted = useRef(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(musicTrack);
    audio.volume = 0.5;
    audio.loop = true;
    audioRef.current = audio;

    // Attempt to autoplay with sound
    const attemptAutoplay = async () => {
      try {
        // First try: play with sound
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
        console.log('Autoplay successful with sound');
      } catch (error) {
        console.log('Autoplay with sound blocked, trying muted...');
        
        // Second try: play muted
        try {
          audio.muted = true;
          await audio.play();
          setIsPlaying(true);
          setIsMuted(true);
          
          // Auto-unmute on first user interaction
          const autoUnmute = () => {
            if (audioRef.current && !autoplayAttempted.current) {
              audioRef.current.muted = false;
              setIsMuted(false);
              autoplayAttempted.current = true;
              console.log('Auto-unmuted on user interaction');
              // Remove listeners after first interaction
              document.removeEventListener('click', autoUnmute);
              document.removeEventListener('keydown', autoUnmute);
              document.removeEventListener('touchstart', autoUnmute);
            }
          };
          
          document.addEventListener('click', autoUnmute);
          document.addEventListener('keydown', autoUnmute);
          document.addEventListener('touchstart', autoUnmute);
        } catch (mutedError) {
          console.log('Autoplay completely blocked');
          setIsMuted(true);
        }
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
