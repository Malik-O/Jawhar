'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface AudioSyncPlayerProps {
  audioUrl: string;
  words: WordTimestamp[];
  duration: number;
}

/** Formats seconds to mm:ss */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioSyncPlayer({ audioUrl, words, duration }: AudioSyncPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audio.duration || duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [duration]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleWordClick = useCallback((wordStart: number) => {
    seekTo(wordStart);
    const audio = audioRef.current;
    if (audio && !isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  }, [seekTo, isPlaying]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    seekTo(percent * audioDuration);
  }, [seekTo, audioDuration]);

  const changeSpeed = useCallback(() => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, [playbackRate]);

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Auto-scroll to active word
  useEffect(() => {
    if (!containerRef.current) return;
    const active = containerRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  return (
    <div className="flex flex-col gap-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Player controls */}
      <div className="sticky top-0 z-20 bg-[#0d1529]/95 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#d4a843] hover:bg-[#e0b94e] flex items-center justify-center transition-colors shrink-0"
            id="audio-play-btn"
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f172a">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f172a">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Progress bar */}
          <div
            className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-[#d4a843] rounded-full transition-[width] duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time */}
          <span className="text-xs text-slate-400 font-mono shrink-0 min-w-[80px] text-center">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>

          {/* Speed */}
          <button
            onClick={changeSpeed}
            className="text-xs text-slate-400 border border-white/10 rounded-md px-2 py-1 hover:bg-white/5 transition-colors shrink-0"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Synced words */}
      {words.length > 0 && (
        <div
          ref={containerRef}
          className="bg-[#0f172a] p-6 rounded-xl border border-white/5 leading-[2.2] text-[1.1rem] max-h-[500px] overflow-y-auto"
          dir="rtl"
        >
          {words.map((w, i) => {
            const isActive = currentTime >= w.start && currentTime < w.end;
            const isPast = currentTime >= w.end;
            return (
              <span
                key={i}
                data-active={isActive}
                onClick={() => handleWordClick(w.start)}
                className={`
                  inline-block px-[2px] py-[1px] rounded cursor-pointer transition-all duration-150
                  ${isActive
                    ? 'bg-[#d4a843]/30 text-[#d4a843] font-semibold scale-105'
                    : isPast
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }
                  hover:bg-white/10
                `}
              >
                {w.word}{' '}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
