export interface SessionData {
  _id: string;
  sessionId?: string;
  originalFileName: string;
  fileType: 'audio' | 'video';
  status: SessionStatus;
  failedAt: string;
  title: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  createdAt: string;
}

export interface SessionListItem {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: 'audio' | 'video';
  status: SessionStatus;
  failedAt: string;
  createdAt: string;
}

export type SessionStatus = 'uploaded' | 'extracted' | 'transcribed' | 'summarized' | 'failed';

export type PipelineStep = 'idle' | 'uploading' | 'extracting' | 'transcribing' | 'summarizing' | 'done' | 'error';

export interface StepResult {
  sessionId: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
}
