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
  const listenersAttached = useRef(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(musicTrack);
    audio.volume = 0.5;
    audio.loop = true;
    audioRef.current = audio;

    // Auto-unmute handler
    const autoUnmute = () => {
      if (audioRef.current && listenersAttached.current) {
        audioRef.current.muted = false;
        setIsMuted(false);
        console.log('Auto-unmuted on user interaction');
        // Remove listeners after first interaction
        document.removeEventListener('click', autoUnmute, true);
        document.removeEventListener('keydown', autoUnmute, true);
        document.removeEventListener('touchstart', autoUnmute, true);
        listenersAttached.current = false;
      }
    };

    // Attempt to autoplay with sound
    const attemptAutoplay = async () => {
      try {
        // First try: play with sound
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
        console.log('Autoplay successful with sound');
      } catch (error) {
        console.log('Autoplay with sound blocked, starting muted...');
        
        // Start muted and play
        audio.muted = true;
        setIsMuted(true);
        
        try {
          await audio.play();
          setIsPlaying(true);
          console.log('Playing muted, will unmute on user interaction');
          
          // Attach event listeners for auto-unmute
          if (!listenersAttached.current) {
            document.addEventListener('click', autoUnmute, true);
            document.addEventListener('keydown', autoUnmute, true);
            document.addEventListener('touchstart', autoUnmute, true);
            listenersAttached.current = true;
          }
        } catch (mutedError) {
          console.log('Autoplay completely blocked:', mutedError);
          setIsMuted(true);
        }
      }
    };

    attemptAutoplay();

    // Cleanup on unmount
    return () => {
      if (listenersAttached.current) {
        document.removeEventListener('click', autoUnmute, true);
        document.removeEventListener('keydown', autoUnmute, true);
        document.removeEventListener('touchstart', autoUnmute, true);
      }
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
