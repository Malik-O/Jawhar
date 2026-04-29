'use client';

import { PipelineStep } from '../types/session';
import { IconUpload, IconAudioWave, IconMic, IconBrain, IconCheck, IconX, IconRefresh, IconPlay, IconArrowRight } from './Icons';

interface ProcessingViewProps {
  step: PipelineStep;
  /** Which step failed or where processing stopped (e.g. 'summarizing') */
  failedAtStep?: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
  errorMessage: string;
  onRetry: (fromStep: string) => void;
  onReset: () => void;
}

interface StepDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  pipelineStep: PipelineStep;
}

const STEPS: StepDef[] = [
  { key: 'uploading', label: 'رفع الملف', icon: <IconUpload size={22} />, pipelineStep: 'uploading' },
  { key: 'extracting', label: 'استخراج الصوت', icon: <IconAudioWave size={22} />, pipelineStep: 'extracting' },
  { key: 'transcribing', label: 'تفريغ النص (Whisper)', icon: <IconMic size={22} />, pipelineStep: 'transcribing' },
  { key: 'summarizing', label: 'التلخيص (Gemini)', icon: <IconBrain size={22} />, pipelineStep: 'summarizing' },
];

const STEP_ORDER = ['uploading', 'extracting', 'transcribing', 'summarizing', 'done'];

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
  step, failedAtStep, transcript, title, summary, keyPoints, errorMessage, onRetry, onReset,
}: ProcessingViewProps) {
  if (step === 'idle' && !failedAtStep) return null;

  const isError = step === 'error' || !!failedAtStep;
  const isDone = step === 'done';
  const isStopped = isError && !!failedAtStep;
  const resumeStep = failedAtStep ? getResumeStep(failedAtStep) : '';

  return (
    <div className="processing-view" id="processing-view">
      {/* Step indicators */}
      <div className="pv-steps">
        {STEPS.map((s) => {
          const status = getStepStatus(step, s.key, failedAtStep);
          return (
            <div key={s.key} className={`pv-step ${status}`}>
              <div className="pv-step-icon">
                {status === 'completed' ? (
                  <IconCheck size={18} />
                ) : status === 'active' ? (
                  <span className="pv-spinner" />
                ) : status === 'error' ? (
                  <IconX size={18} />
                ) : (
                  s.icon
                )}
              </div>
              <span className="pv-step-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error / Stopped banner with Resume button */}
      {isStopped && (
        <div className="pv-stopped-banner">
          <div className="pv-stopped-info">
            <IconX size={20} className="pv-error-icon" />
            <span className="pv-error-text">{errorMessage}</span>
          </div>
          <div className="pv-stopped-actions">
            <button
              className="pv-resume-btn"
              onClick={() => onRetry(resumeStep)}
              id="resume-button"
            >
              <IconPlay size={16} />
              متابعة المعالجة
            </button>
            <button className="pv-back-btn" onClick={onReset}>
              <IconArrowRight size={16} />
              رجوع
            </button>
          </div>
        </div>
      )}

      {/* Regular error during active processing (no failedAtStep) */}
      {isError && !failedAtStep && (
        <div className="pv-error">
          <IconX size={20} className="pv-error-icon" />
          <span className="pv-error-text">{errorMessage}</span>
          <button className="pv-error-btn" onClick={onReset}>
            رجوع
          </button>
        </div>
      )}

      {/* Live data display */}
      <div className="pv-data">
        {transcript && (
          <div className="pv-data-section">
            <h3 className="pv-data-title">
              <IconMic size={18} />
              النص المفرّغ
            </h3>
            <div className="pv-transcript-box">{transcript}</div>
          </div>
        )}

        {title && (
          <div className="pv-data-section">
            <h3 className="pv-data-title">
              <IconBrain size={18} />
              العنوان المقترح
            </h3>
            <p className="pv-title-text">{title}</p>
          </div>
        )}

        {summary && (
          <div className="pv-data-section">
            <h3 className="pv-data-title">
              <IconBrain size={18} />
              الملخص
            </h3>
            <div className="pv-summary-text">{summary}</div>
          </div>
        )}

        {keyPoints.length > 0 && (
          <div className="pv-data-section">
            <h3 className="pv-data-title">
              <IconBrain size={18} />
              النقاط الرئيسية
            </h3>
            <ul className="pv-keypoints">
              {keyPoints.map((p, i) => (
                <li key={i} className="pv-keypoint">
                  <span className="pv-kp-num">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Done actions */}
      {isDone && (
        <div className="pv-done-actions">
          <button className="action-btn print-btn" onClick={() => window.print()}>
            <IconPlay size={18} />
            عرض الملخص الكامل
          </button>
        </div>
      )}
    </div>
  );
}
