'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { IconSkipBack10, IconSkipForward10 } from './Icons';

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioSyncPlayer({ audioUrl, words, duration }: AudioSyncPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const shouldAutoScrollRef = useRef(false);

  /* ── Initialize WaveSurfer ── */
  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(255,255,255,0.1)',
      progressColor: '#FF9800',
      cursorColor: 'rgba(255,152,0,0.6)',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      height: 64,
      normalize: true,
      url: audioUrl,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsReady(true);
      setAudioDuration(ws.getDuration());
    });

    ws.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    /* 'interaction' fires on mouse up after drag/click — auto-scroll only then */
    ws.on('interaction', () => {
      shouldAutoScrollRef.current = true;
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;
    ws.playPause();
    shouldAutoScrollRef.current = true;
  }, [isReady]);

  const seekBy = useCallback((delta: number) => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;
    const newTime = Math.max(0, Math.min(ws.getDuration(), ws.getCurrentTime() + delta));
    ws.setTime(newTime);
    setCurrentTime(newTime);
    shouldAutoScrollRef.current = true;
  }, [isReady]);

  const handleWordClick = useCallback((wordStart: number) => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;
    ws.setTime(wordStart);
    setCurrentTime(wordStart);
    shouldAutoScrollRef.current = true;
    if (!isPlaying) {
      ws.play();
    }
  }, [isReady, isPlaying]);

  const changeSpeed = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    ws.setPlaybackRate(next);
  }, [playbackRate]);

  /* ── Auto-scroll: only when flagged (play start, seek, or mouse up) ── */
  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    const container = containerRef.current?.parentElement?.querySelector('[data-words-container]');
    if (!container) return;
    const active = container.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    shouldAutoScrollRef.current = false;
  }, [currentTime]);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#1a1a1a] border border-[#FF9800]/15 rounded-[20px] p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#FF9800] font-medium tracking-wide">ملف الاستماع والمراجعة</span>
          <span className="text-[0.65rem] text-[#808080] font-mono">{formatTime(audioDuration)}</span>
        </div>

        {/* WaveSurfer waveform */}
        <div className="relative w-full">
          <div
            ref={containerRef}
            className="ws-rtl w-full cursor-pointer select-none rounded-lg"
            style={{ minHeight: 64 }}
          />
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={changeSpeed}
            className="text-[0.7rem] text-[#FF9800] border border-[#FF9800]/25 bg-[#FF9800]/10 rounded-[10px] px-2.5 py-1 hover:bg-[#FF9800]/20 transition-colors shrink-0 font-medium cursor-pointer"
          >
            {playbackRate}x
          </button>

          <button
            onClick={() => seekBy(-10)}
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all hover:scale-105 shrink-0 text-[#808080] hover:text-[#FF9800] cursor-pointer"
            title="رجوع 10 ثوانٍ"
          >
            <IconSkipBack10 size={18} />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 shrink-0 cursor-pointer ss-accent-btn"
            id="audio-play-btn"
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#101010">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#101010">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => seekBy(10)}
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all hover:scale-105 shrink-0 text-[#808080] hover:text-[#FF9800] cursor-pointer"
            title="تقديم 10 ثوانٍ"
          >
            <IconSkipForward10 size={18} />
          </button>

          <span className="text-xs text-[#808080] font-mono shrink-0 min-w-[70px] text-center">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
        </div>
      </div>

      {words.length > 0 && (
        <div
          data-words-container
          className="bg-[#161616] p-3 sm:p-5 rounded-[20px] border border-white/[0.08] leading-[2.4] text-[1.05rem] max-h-[250px] sm:max-h-[300px] overflow-y-auto"
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
                  inline-block px-[3px] py-[1px] rounded cursor-pointer transition-all duration-150
                  ${isActive
                    ? 'bg-[#FF9800]/25 text-[#FF9800] font-semibold'
                    : isPast
                      ? 'text-[#808080]'
                      : 'text-[#808080]/60'
                  }
                  hover:bg-white/[0.06]
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
