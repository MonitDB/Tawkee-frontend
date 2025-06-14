import { useState, useRef, useCallback } from 'react';

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentVoiceId: string | null;
  error: string | null;
}

export const useAudioPlayback = () => {
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentVoiceId: null,
    error: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoicePreview = useCallback(async (voiceId: string, previewUrl: string) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentVoiceId: voiceId,
        error: null,
      }));

      // Create new audio element
      const audio = new Audio(previewUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentVoiceId: null,
        }));
        audioRef.current = null;
      });

      audio.addEventListener('error', () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentVoiceId: null,
          error: 'Failed to play audio preview',
        }));
        audioRef.current = null;
      });

      // Play the audio
      await audio.play();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentVoiceId: null,
        error: 'Failed to play audio preview',
      }));
      audioRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentVoiceId: null,
    }));
  }, []);

  return {
    ...state,
    playVoicePreview,
    stopPlayback,
  };
};