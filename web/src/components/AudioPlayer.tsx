'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { AudioFile } from '../types/audio';
import { formatTime } from '../utils/helpers';
import WaveSurfer from 'wavesurfer.js';
import { groupWordsToSentences } from '../utils/audioUtils';

import PlaybackSettings, { PlaybackMode } from './player/PlaybackSettings';
import MainControls from './player/MainControls';
import SmartControls from './player/SmartControls';

interface AudioPlayerProps {
  // AudioPlayer
  audioFile: AudioFile;
  currentTime: number;
  duration: number;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onSeek: (time: number) => void;
  onEnded: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  // PlaybackSettings
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  playbackMode: PlaybackMode;
  onPlaybackModeChange: (mode: PlaybackMode) => void;
  // MainControls
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: (seconds: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function AudioPlayer({
  audioFile, currentTime, duration, onTimeUpdate,
  onLoadedMetadata, onEnded, audioRef,
  playbackSpeed, onSpeedChange, playbackMode, onPlaybackModeChange,
  isPlaying, onPlayPause, onSkip, onNext, onPrevious, hasNext, hasPrevious,
}: AudioPlayerProps) {

  const waveformRef = useRef<HTMLDivElement>(null); // Container cho waveform
  const wavesurferRef = useRef<WaveSurfer | null>(null); // Instance của wavesurfer

  // === Smart Listening State ===
  const [loopA, setLoopA] = React.useState<number | null>(null);
  const [loopB, setLoopB] = React.useState<number | null>(null);
  const [isAbLoopActive, setIsAbLoopActive] = React.useState(false);
  const [isSentenceLoopActive, setIsSentenceLoopActive] = React.useState(false);

  const sentences = React.useMemo(() =>
    groupWordsToSentences(audioFile.transcript),
    [audioFile.transcript]
  );

  // Reset loop state when file changes
  useEffect(() => {
    setLoopA(null);
    setLoopB(null);
    setIsAbLoopActive(false);
    setIsSentenceLoopActive(false);
  }, [audioFile.id]);

  // Set Loop A
  const handleSetLoopA = () => {
    if (audioRef.current) {
      setLoopA(audioRef.current.currentTime);
      // If B exists and A < B, auto activate. Otherwise just set A.
      if (loopB !== null && audioRef.current.currentTime < loopB) {
        setIsAbLoopActive(true);
      } else if (loopB !== null) {
        // Invalid range, reset B
        setLoopB(null);
        setIsAbLoopActive(false);
      }
    }
  };

  // Set Loop B
  const handleSetLoopB = () => {
    if (audioRef.current) {
      const b = audioRef.current.currentTime;
      if (loopA !== null && b > loopA) {
        setLoopB(b);
        setIsAbLoopActive(true);
        // Disable sentence loop if AB is active to avoid conflict
        setIsSentenceLoopActive(false);
        // Jump back to A immediately
        audioRef.current.currentTime = loopA;
      } else {
        // Invalid, maybe notify user? For now just ignore
      }
    }
  };

  const clearLoop = () => {
    setLoopA(null);
    setLoopB(null);
    setIsAbLoopActive(false);
  };

  // === Loop Logic ===
  useEffect(() => {
    if (!audioRef.current) return;

    const checkLoop = () => {
      const currentTime = audioRef.current?.currentTime || 0;

      // 1. A-B Loop Strategy
      if (isAbLoopActive && loopA !== null && loopB !== null) {
        if (currentTime >= loopB || currentTime < loopA) {
          if (audioRef.current) audioRef.current.currentTime = loopA;
        }
      }

      // 2. Sentence Loop Strategy
      else if (isSentenceLoopActive && sentences.length > 0) {
        const currentSentence = sentences.find(s => currentTime >= s.start && currentTime <= s.end);

        // If we are playing, and we are slightly past the end of the sentence
        if (currentSentence) {
          // Nothing specific, just playing inside a sentence
        } else {
          // Might be between sentences or at the very end.
          // Find the closest previous sentence to loop back to
          const prevSentence = sentences.findLast(s => s.end <= currentTime);
          if (prevSentence) {
            // Check if we just finished this sentence
            // Tolerance: if we are within 0.5s of the end, loop back
            const timeSinceEnd = currentTime - prevSentence.end;
            if (timeSinceEnd > 0 && timeSinceEnd < 1.0) {
              if (audioRef.current) audioRef.current.currentTime = prevSentence.start;
            }
          }
        }
      }
    };

    // Since 'timeupdate' fires at 4-5Hz, it might be too slow for precise looping.
    // But for language learning, it is often acceptable. 
    // WaveSurfer's 'audioprocess' fires more often but we are using native audio element.
    // We rely on parent 'onTimeUpdate' or add our own listener.
    const el = audioRef.current;
    el.addEventListener('timeupdate', checkLoop);
    return () => {
      el.removeEventListener('timeupdate', checkLoop);
    };
  }, [isAbLoopActive, isSentenceLoopActive, loopA, loopB, sentences]);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Destroy instance cũ nếu có
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Khởi tạo WaveSurfer mới
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#a3a3a3',
      progressColor: '#4f46e5',
      cursorColor: '#1e40af',
      barWidth: 3,
      barRadius: 3,
      height: 80,
      normalize: true,
      backend: 'MediaElement'
    });

    // load audio
    wavesurferRef.current.load(audioFile.url).catch((err) => {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.log('WaveSurfer load aborted (cleanup)');
      } else {
        console.error('WaveSurfer load error:', err);
      }
    });

    wavesurferRef.current.on('ready', () => {
      // Gán WaveSurfer's audio element vào audioRef để parent có thể truy cập
      if (audioRef && wavesurferRef.current) {
        const wavesurferAudio = wavesurferRef.current.getMediaElement();
        if (wavesurferAudio) {
          // @ts-ignore - Gán audio element của WaveSurfer vào audioRef
          audioRef.current = wavesurferAudio;
        }
      }
      onLoadedMetadata();

      // Auto-play nếu đang ở trạng thái playing
      if (isPlaying && wavesurferRef.current) {
        wavesurferRef.current.play();
      }
    });

    wavesurferRef.current.on('audioprocess', () => {
      onTimeUpdate();
    });

    wavesurferRef.current.on('finish', () => {
      onEnded();
    });

    // Cleanup
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.stop();
        wavesurferRef.current.destroy();
      }
    };
  }, [audioFile.url]);

  // Đồng bộ play/pause state
  useEffect(() => {
    if (!wavesurferRef.current) return;
    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);

  // Đồng bộ playback speed
  useEffect(() => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  return (
    <Card className="shadow-lg">
      <div className="flex flex-col gap-4" style={{ marginTop: '-0.75rem' }}>
        <h2 className="text-2xl font-bold text-indigo-900 border-b pb-4">
          Audio Player
        </h2>

        {/* WaveSurfer manages audio element internally */}

        {/* Waveform Visualization */}
        <div className="space-y-2">
          <div
            ref={waveformRef}
            className='w-full border-2 border-gray-200 rounded-lg overflow-hidden'
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <MainControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onSkip={onSkip}
          onNext={onNext}
          onPrevious={onPrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />

        {/* Smart Listening Tools */}
        <SmartControls
          loopA={loopA}
          loopB={loopB}
          isAbLoopActive={isAbLoopActive}
          isSentenceLoopActive={isSentenceLoopActive}
          onSetLoopA={handleSetLoopA}
          onSetLoopB={handleSetLoopB}
          onClearLoop={clearLoop}
          onToggleSentenceLoop={() => {
            const newState = !isSentenceLoopActive;
            setIsSentenceLoopActive(newState);
            if (newState) {
              setIsAbLoopActive(false);
              setLoopA(null);
              setLoopB(null);
            }
          }}
        />

        {/* Speed & Mode Controls */}
        <PlaybackSettings
          playbackSpeed={playbackSpeed}
          onSpeedChange={onSpeedChange}
          playbackMode={playbackMode}
          onPlaybackModeChange={onPlaybackModeChange}
        />

        {/* Current File Info */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Now Playing:</p>
          <p className="font-semibold text-indigo-900">{audioFile.name}</p>
        </div>
      </div>
    </Card >
  );
}