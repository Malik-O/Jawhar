'use client';

import { PipelineStep, QuranVerse, ProgressInfo } from '../types/session';
import { IconUpload, IconAudioWave, IconMic, IconBrain, IconBook, IconCheck, IconX, IconPlay, IconArrowRight, IconHeadphones } from './Icons';
import ParsedTranscript from './ParsedTranscript';
import AudioSyncPlayer from './AudioSyncPlayer';
import { filterArabicOnly } from '../utils/arabicFilter';

interface ProcessingViewProps {
  step: PipelineStep;
  /** Which step failed or where processing stopped (e.g. 'summarizing') */
  failedAtStep?: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
  quranVerses: QuranVerse[];
  errorMessage: string;
  audioUrl?: string;
  words?: { word: string; start: number; end: number; speaker?: string }[];
  progress?: ProgressInfo | null;
  onRetry: () => void;
  onReset: () => void;
}

interface StepDef {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  pipelineStep: PipelineStep;
}

const STEPS: StepDef[] = [
  { key: 'uploading', label: 'رفع الملف', hint: 'جارٍ استلام الملف وتهيئته للمعالجة', icon: <IconUpload size={20} />, pipelineStep: 'uploading' },
  { key: 'extracting', label: 'استخراج الصوت', hint: 'تحويل الملف إلى مسار صوتي نقي عالي الجودة', icon: <IconAudioWave size={20} />, pipelineStep: 'extracting' },
  { key: 'transcribing', label: 'تفريغ النص', hint: 'تحويل الصوت إلى نص مكتوب بدقة باستخدام Whisper', icon: <IconMic size={20} />, pipelineStep: 'transcribing' },
  { key: 'enriching', label: 'استخراج الآيات', hint: 'تحديد الآيات القرآنية وإثراؤها بالنص العثماني', icon: <IconBook size={20} />, pipelineStep: 'enriching' },
  { key: 'summarizing', label: 'التلخيص', hint: 'توليد عنوان وملخص ونقاط رئيسية بالذكاء الاصطناعي', icon: <IconBrain size={20} />, pipelineStep: 'summarizing' },
  { key: 'listening', label: 'الاستماع والمراجعة', hint: 'استمع للملف الصوتي مع متابعة النص المفرّغ', icon: <IconHeadphones size={20} />, pipelineStep: 'done' },
];

const STEP_ORDER = ['uploading', 'extracting', 'transcribing', 'enriching', 'summarizing', 'listening', 'done'];

/**
 * Determines step visual status.
 * When viewing a stopped/failed session, uses `failedAtStep` to mark
 * earlier steps as completed and the failed step as error.
 */
function getStepStatus(
  currentStep: PipelineStep,
  targetKey: string,
  failedAtStep?: string
): 'completed' | 'active' | 'pending' | 'error' {

  // Case 1: Error state with a known failed step
  if ((currentStep === 'error' || currentStep === 'idle') && failedAtStep) {
    const failIdx = STEP_ORDER.indexOf(failedAtStep);
    const targetIdx = STEP_ORDER.indexOf(targetKey);

    if (targetIdx < failIdx) return 'completed';
    if (targetIdx === failIdx) return 'error';
    return 'pending';
  }

  // Case 2: Done — everything completed
  if (currentStep === 'done') return 'completed';

  // Case 3: Actively processing
  const ci = STEP_ORDER.indexOf(currentStep);
  const ti = STEP_ORDER.indexOf(targetKey);
  if (ti < ci) return 'completed';
  if (ti === ci) return 'active';
  return 'pending';
}

/** Determines which step should be resumed based on failedAtStep */
function getResumeStep(failedAtStep: string): string {
  return failedAtStep;
}

export default function ProcessingView({
  step, failedAtStep, transcript, title, summary, keyPoints, quranVerses, errorMessage, audioUrl, words, progress, onRetry, onReset,
}: ProcessingViewProps) {
  if (step === 'idle' && !failedAtStep) return null;

  const isError = step === 'error' || !!failedAtStep;
  const isDone = step === 'done';
  const isStopped = isError && !!failedAtStep;
  const resumeStep = failedAtStep ? getResumeStep(failedAtStep) : '';
  const progressPercent = progress?.progress ?? 0;
  const isProcessing = !isError && !isDone;

  return (
    <div className="w-full max-w-[720px] mx-auto animate-slide-up px-3 sm:px-0" id="processing-view">
      {/* Real-time progress bar */}
      {isProcessing && progress && (
        <div className="mb-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06] p-4 sm:p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#FF9800]">
              {progress.message || (progress.status === 'uploading' ? 'جارٍ رفع الملف' : '')}
            </span>
            <span className="text-xs text-[#808080] font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#FF9800] to-[#FFB74D] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progress.chunk && progress.total && progress.total > 1 && (
            <div className="flex items-center gap-2 mt-2">
              {Array.from({ length: progress.total }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    i < progress.chunk! - 1
                      ? 'bg-[#00C8C8]/60'
                      : i === progress.chunk! - 1
                      ? 'bg-[#FF9800]'
                      : 'bg-white/[0.06]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step indicators — vertical timeline */}
      <div className="relative mb-8 rounded-[20px] bg-white/[0.02] border border-white/[0.06] p-4 sm:p-5 sm:p-6">
        <div className="flex flex-col gap-0">
          {STEPS.map((s, idx) => {
            const status = getStepStatus(step, s.key, failedAtStep);
            const isLast = idx === STEPS.length - 1;

            return (
              <div key={s.key} className="flex gap-4 relative">
                {/* Connecting line */}
                {!isLast && (
                  <div className={`absolute right-[19px] top-[44px] bottom-0 w-[2px] rounded-full transition-all duration-500 ${
                    status === 'completed' ? 'bg-gradient-to-b from-[#00C8C8]/60 to-[#00C8C8]/20' : 'bg-white/[0.06]'
                  }`} />
                )}

                {/* Icon circle */}
                <div className={`relative flex items-center justify-center w-10 h-10 min-w-10 rounded-full border-2 transition-all duration-300 z-10 ${
                  status === 'active'
                    ? 'border-[#FF9800] bg-[#FF9800]/15 text-[#FF9800] shadow-[0_0_20px_rgba(255,152,0,0.15)]'
                    : status === 'completed'
                    ? 'border-[#00C8C8]/40 bg-[#00C8C8]/10 text-[#00C8C8]'
                    : status === 'error'
                    ? 'border-red-400/40 bg-red-400/10 text-red-400'
                    : 'border-white/[0.08] bg-white/[0.03] text-[#606060]'
                }`}>
                  {status === 'completed' ? (
                    <IconCheck size={18} />
                  ) : status === 'active' ? (
                    <span className="w-4 h-4 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
                  ) : status === 'error' ? (
                    <IconX size={18} />
                  ) : (
                    s.icon
                  )}
                </div>

                {/* Label + hint */}
                <div className={`flex flex-col pt-1.5 pb-4 flex-1 transition-all duration-300 ${
                  status === 'active' ? 'opacity-100' : status === 'pending' ? 'opacity-50' : 'opacity-80'
                }`}>
                  <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${
                    status === 'active' ? 'text-[#FF9800]' : status === 'completed' ? 'text-[#00C8C8]' : status === 'error' ? 'text-red-400' : 'text-[#808080]'
                  }`}>
                    {s.label}
                  </span>
                  <span className={`text-[0.72rem] mt-1 leading-relaxed ${
                    status === 'active' ? 'text-[#B0B0B0]' : 'text-[#606060]'
                  }`}>
                    {s.hint}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Stopped banner with Resume button */}
      {isStopped && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-[20px] bg-[#FF9800]/[0.06] border border-[#FF9800]/25 mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <IconX size={20} className="text-red-400 min-w-5" />
            <span className="flex-1 text-red-400 text-sm">{errorMessage}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              className="ss-accent-btn flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-[10px] font-semibold border-none cursor-pointer"
              onClick={() => onRetry()}
              id="resume-button"
            >
              <IconPlay size={16} />
              متابعة المعالجة
            </button>
            <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[10px] border border-white/[0.08] bg-transparent text-[#B0B0B0] text-sm hover:bg-white/[0.06] hover:text-[#E0E0E0] transition-all cursor-pointer" onClick={onReset}>
              <IconArrowRight size={16} />
              رجوع
            </button>
          </div>
        </div>
      )}

      {/* Regular error during active processing */}
      {isError && !failedAtStep && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-[10px] bg-red-400/[0.08] border border-red-400/20 mb-6">
          <IconX size={20} className="text-red-400 min-w-5" />
          <span className="flex-1 text-red-400 text-sm">{errorMessage}</span>
          <button className="px-4 py-1.5 rounded-[10px] border border-red-400/30 bg-transparent text-[#B0B0B0] text-sm hover:bg-white/[0.06] hover:text-[#E0E0E0] transition-all cursor-pointer" onClick={onReset}>
            رجوع
          </button>
        </div>
      )}

      {/* Live data display */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {audioUrl && words && words.length > 0 && (
          <div className="bg-white/[0.035] border border-white/[0.08] rounded-[20px] px-4 sm:px-5 py-4 animate-fade-in">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FF9800] mb-3 pb-2 border-b border-white/[0.08]">
              <IconHeadphones size={18} />
              الاستماع والمراجعة
            </h3>
            <AudioSyncPlayer
              audioUrl={audioUrl}
              words={words}
              duration={0}
            />
          </div>
        )}

        {transcript && (
          <div className="bg-white/[0.035] border border-white/[0.08] rounded-[20px] px-4 sm:px-5 py-4 animate-fade-in">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FF9800] mb-3 pb-2 border-b border-white/[0.08]">
              <IconMic size={18} />
              النص المفرّغ
            </h3>
            <div className="bg-[#161616]/50 p-3 sm:p-4 rounded-[10px] border border-white/5 mt-2 h-[250px] sm:h-[300px] overflow-y-auto text-[#B0B0B0] text-sm leading-[1.9] whitespace-pre-wrap">
              <ParsedTranscript text={transcript} quranVerses={quranVerses} />
            </div>
          </div>
        )}

        {title && (
          <div className="bg-white/[0.035] border border-white/[0.08] rounded-[20px] px-4 sm:px-5 py-4 animate-fade-in">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FF9800] mb-3 pb-2 border-b border-white/[0.08]">
              <IconBrain size={18} />
              العنوان المقترح
            </h3>
            <p className="text-base sm:text-lg font-semibold text-[#E0E0E0]">{filterArabicOnly(title)}</p>
          </div>
        )}

        {summary && (
          <div className="bg-white/[0.035] border border-white/[0.08] rounded-[20px] px-4 sm:px-5 py-4 animate-fade-in">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FF9800] mb-3 pb-2 border-b border-white/[0.08]">
              <IconBrain size={18} />
              الملخص
            </h3>
            <div className="text-[#E0E0E0] text-sm leading-[1.9] whitespace-pre-wrap">{filterArabicOnly(summary)}</div>
          </div>
        )}

        {keyPoints.length > 0 && (
          <div className="bg-white/[0.035] border border-white/[0.08] rounded-[20px] px-4 sm:px-5 py-4 animate-fade-in">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FF9800] mb-3 pb-2 border-b border-white/[0.08]">
              <IconBrain size={18} />
              النقاط الرئيسية
            </h3>
            <ul className="list-none flex flex-col gap-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-3 py-2 text-sm text-[#E0E0E0] leading-relaxed">
                  <span className="flex items-center justify-center w-6 h-6 min-w-6 rounded-full bg-[#FF9800] text-[#101010] font-bold text-xs">{i + 1}</span>
                  <span>{filterArabicOnly(p)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Done actions */}
      {isDone && (
        <div className="mt-6 flex justify-center">
          <button className="ss-accent-btn flex items-center gap-2 px-6 py-2.5 rounded-[10px] font-semibold border-none cursor-pointer" onClick={() => window.print()}>
            <IconPlay size={18} />
            عرض الملخص الكامل
          </button>
        </div>
      )}
    </div>
  );
}
