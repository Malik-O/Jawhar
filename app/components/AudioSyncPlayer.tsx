'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAuth } from '@clerk/nextjs';
import { IconSkipBack10, IconSkipForward10 } from './Icons';
import { filterArabicOnly } from '../utils/arabicFilter';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  speaker?: string;
}

const SPEAKER_COLORS = [
  '#FF9800', '#00C8C8', '#7C4DFF', '#4CAF50',
  '#E91E63', '#2196F3', '#FF5722', '#FFC107',
];

function getSpeakerColor(speaker?: string): string | null {
  if (!speaker) return null;
  const idx = parseInt(speaker.replace('SPEAKER_', '')) || 0;
  return SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const shouldAutoScrollRef = useRef(false);

  const { getToken } = useAuth();

  /* ── Initialize WaveSurfer ── */
  useEffect(() => {
    let ws: WaveSurfer | null = null;
    let isCancelled = false;

    async function initWs() {
      if (!containerRef.current || !audioUrl) return;

      const token = await getToken().catch(() => null);
      if (isCancelled) return;

      ws = WaveSurfer.create({
        container: containerRef.current!,
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
        fetchParams: token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : undefined
      });

      wavesurferRef.current = ws;

      ws.on('ready', () => {
        if (isCancelled) return;
        setIsReady(true);
        setAudioDuration(ws!.getDuration());
      });

      ws.on('timeupdate', (time) => {
        if (isCancelled) return;
        setCurrentTime(time);
      });

      ws.on('play', () => { if (!isCancelled) setIsPlaying(true) });
      ws.on('pause', () => { if (!isCancelled) setIsPlaying(false) });
      ws.on('finish', () => { if (!isCancelled) setIsPlaying(false) });
    }

    initWs();

    return () => {
      isCancelled = true;
      if (ws) {
        ws.destroy();
      }
      wavesurferRef.current = null;
    };
  }, [audioUrl, getToken]);

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

  /* ── RTL seek: overlay handles mouse, flips X to seek correctly ── */
  const seekFromOverlay = useCallback((clientX: number) => {
    const ws = wavesurferRef.current;
    const overlay = overlayRef.current;
    if (!ws || !overlay || !isReady) return;
    const rect = overlay.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    /* RTL: right edge = 0% (start), left edge = 100% (end) */
    const percent = 1 - x / rect.width;
    ws.setTime(percent * ws.getDuration());
  }, [isReady]);

  const handleOverlayMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekFromOverlay(e.clientX);
  }, [seekFromOverlay]);

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    setHoverX(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
    if (isDragging) {
      seekFromOverlay(e.clientX);
    }
  }, [isDragging, seekFromOverlay]);

  const handleOverlayMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  /* Global mouseup to end drag — auto-scroll only on release */
  useEffect(() => {
    if (!isDragging) return;
    const onUp = () => {
      setIsDragging(false);
      /* Delay slightly so currentTime updates from the last seek before scrolling */
      requestAnimationFrame(() => {
        shouldAutoScrollRef.current = true;
      });
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [isDragging]);

  /* Hover time preview (RTL: inverted) */
  const hoverTime = hoverX !== null && audioDuration > 0
    ? (1 - hoverX / (overlayRef.current?.getBoundingClientRect().width || 1)) * audioDuration
    : null;

  /* ── Custom smooth scroll (ease-out cubic) to active word ── */
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  const smoothScrollToActive = useCallback(() => {
    const container = wordsContainerRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (!active) return;

    /* Use getBoundingClientRect for accurate positioning relative to container */
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    /* Distance from active's top to container's top, accounting for current scroll */
    const activeOffsetFromContainerTop = activeRect.top - containerRect.top + container.scrollTop;
    /* Center the active element in the viewport */
    const targetTop = activeOffsetFromContainerTop - container.clientHeight / 2 + activeRect.height / 2;
    const startTop = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const distance = Math.max(0, Math.min(maxScroll, targetTop)) - startTop;

    if (Math.abs(distance) < 1) return;

    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      /* ease-out cubic: 1 - (1 - t)^3 */
      const eased = 1 - Math.pow(1 - t, 3);
      container.scrollTop = startTop + distance * eased;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  /* ── Auto-scroll: only when flagged (play start, seek, or mouse up) ── */
  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    smoothScrollToActive();
    shouldAutoScrollRef.current = false;
  }, [currentTime, smoothScrollToActive]);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#1a1a1a] border border-[#FF9800]/15 rounded-[20px] p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#FF9800] font-medium tracking-wide">ملف الاستماع والمراجعة</span>
          <span className="text-[0.65rem] text-[#808080] font-mono">{formatTime(audioDuration)}</span>
        </div>

        {/* WaveSurfer waveform — canvas flipped for RTL, overlay handles seeking */}
        <div className="relative w-full">
          <div style={{ transform: 'scaleX(-1)' }}>
            <div
              ref={containerRef}
              style={{ minHeight: 64, pointerEvents: 'none' }}
            />
          </div>
          {/* Click/drag overlay — NOT flipped, handles RTL seeking */}
          <div
            ref={overlayRef}
            className="absolute inset-0 cursor-pointer select-none rounded-lg"
            onMouseDown={handleOverlayMouseDown}
            onMouseMove={handleOverlayMouseMove}
            onMouseLeave={handleOverlayMouseLeave}
          />
          {/* Hover time tooltip */}
          {hoverTime !== null && hoverX !== null && overlayRef.current && (
            <div
              className="absolute -top-7 pointer-events-none bg-[#1a1a1a] border border-[#FF9800]/30 rounded-[10px] px-2 py-0.5 text-[0.65rem] text-[#FF9800] font-mono z-10"
              style={{
                left: `${(hoverX / overlayRef.current.getBoundingClientRect().width) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
          ref={wordsContainerRef}
          data-words-container
          className="bg-[#161616] p-3 sm:p-5 rounded-[20px] border border-white/[0.08] leading-[2.4] text-[1.05rem] max-h-[250px] sm:max-h-[300px] overflow-y-auto"
          dir="rtl"
        >
          {words.map((w, i) => {
            const isActive = currentTime >= w.start && currentTime < w.end;
            const isPast = currentTime >= w.end;
            const speakerColor = getSpeakerColor(w.speaker);
            return (
              <span
                key={i}
                data-active={isActive}
                onClick={() => handleWordClick(w.start)}
                style={speakerColor && !isActive ? { borderBottom: `2px solid ${speakerColor}30` } : undefined}
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
                {filterArabicOnly(w.word)}{' '}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
