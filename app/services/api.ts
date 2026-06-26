import { SessionData, SessionListItem, QuranVerse } from '../types/session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Step 1: Upload file and create session */
export async function startSession(file: File): Promise<{ sessionId: string; originalFileName: string; fileType: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/sessions/start`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل رفع الملف');
  }
  return res.json();
}

/** Step 2: Extract audio */
export async function extractAudio(sessionId: string): Promise<{ status: string; skipped: boolean }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/extract`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل استخراج الصوت');
  }
  return res.json();
}

/** Step 3: Transcribe with Groq Whisper */
export async function transcribeAudio(sessionId: string): Promise<{ status: string; transcript: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/transcribe`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل تفريغ النص');
  }
  return res.json();
}

/** Step 4: Enrich Quran verses with Uthmani text & references */
export async function enrichVerses(sessionId: string): Promise<{ status: string; quranVerses: QuranVerse[]; transcript: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/enrich-verses`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل استخراج الآيات');
  }
  return res.json();
}

/** Step 5: Summarize with Gemini */
export async function summarizeText(sessionId: string): Promise<{ status: string; title: string; summary: string; keyPoints: string[] }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/summarize`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل التلخيص');
  }
  return res.json();
}

/** Start autonomous processing (fire-and-forget — backend runs full pipeline) */
export async function startProcessing(sessionId: string): Promise<{ sessionId: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/process`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل بدء المعالجة');
  }
  return res.json();
}

/** Stop/cancel active processing */
export async function stopProcessing(sessionId: string): Promise<{ sessionId: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/stop`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل إيقاف المعالجة');
  }
  return res.json();
}

/** Check if session is currently processing and its status */
export async function getSessionStatus(sessionId: string): Promise<{ sessionId: string; processing: boolean; status: string; failedAt: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/status`);
  if (!res.ok) throw new Error('Failed to get session status');
  return res.json();
}

/** Fetch all sessions (pass archived=true to get archived ones) */
export async function fetchSessions(archived = false): Promise<SessionListItem[]> {
  const res = await fetch(`${API_BASE}/api/sessions?archived=${archived}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

/** Archive or unarchive a session */
export async function archiveSession(id: string, archived: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archived }),
  });
  if (!res.ok) throw new Error('Failed to archive session');
}

/** Fetch a single session */
export async function fetchSession(id: string): Promise<SessionData> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

/** Delete a session */
export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}

/** Update transcript text */
export async function updateTranscript(id: string, transcript: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}/transcript`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) throw new Error('Failed to update transcript');
}

/** Update session metadata (title and/or summary) */
export async function updateSessionMetadata(id: string, metadata: { title?: string; summary?: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}/metadata`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) throw new Error('Failed to update metadata');
}

/** Get audio stream URL for a session */
export function getAudioUrl(id: string): string {
  return `${API_BASE}/api/sessions/${id}/audio`;
}
