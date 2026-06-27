export interface QuranVerse {
  ref: string;
  surah: number;
  ayah: number;
  surahName: string;
  uthmani: string;
  transcriptText: string;
}

export interface SpeakerSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface SessionData {
  _id: string;
  sessionId?: string;
  originalFileName: string;
  fileType: 'audio' | 'video';
  status: SessionStatus;
  failedAt: string;
  title: string;
  transcript: string;
  rawTranscript: string;
  words: { word: string; start: number; end: number; speaker: string }[];
  speakerSegments: SpeakerSegment[];
  summary: string;
  keyPoints: string[];
  quranVerses: QuranVerse[];
  duration: number;
  publicKey?: string;
  createdAt: string;
}

export interface SessionListItem {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: 'audio' | 'video';
  status: SessionStatus;
  failedAt: string;
  duration: number;
  archived: boolean;
  lectureId?: string;
  courseId?: string | null;
  publicKey?: string;
  createdAt: string;
}

export type SessionStatus = 'uploaded' | 'extracted' | 'transcribed' | 'enriched' | 'summarized' | 'failed';

export type PipelineStep = 'idle' | 'uploading' | 'extracting' | 'transcribing' | 'enriching' | 'summarizing' | 'done' | 'error';

export interface ProgressInfo {
  progress: number;
  status?: string;
  chunk?: number;
  total?: number;
  message?: string;
  step?: string;
}

export interface StepResult {
  sessionId: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
  quranVerses: QuranVerse[];
  words: { word: string; start: number; end: number; speaker: string }[];
  speakerSegments: SpeakerSegment[];
}
