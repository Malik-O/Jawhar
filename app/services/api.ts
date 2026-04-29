import { SessionData, SessionListItem } from '../types/session';

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

/** Step 4: Summarize with Gemini */
export async function summarizeText(sessionId: string): Promise<{ status: string; title: string; summary: string; keyPoints: string[] }> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/summarize`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل التلخيص');
  }
  return res.json();
}

/** Fetch all sessions */
export async function fetchSessions(): Promise<SessionListItem[]> {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
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
