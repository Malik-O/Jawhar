import {
  PlatformUser, Course, Lecture, LectureWithSession,
  CourseProgress, AdminStats, SheikhListItem,
} from '../types/platform';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function authHeaders(token: string | null): Promise<HeadersInit> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiCall<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...await authHeaders(token), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'حدث خطأ');
  }
  return res.json();
}

export async function syncUser(token: string | null): Promise<PlatformUser> {
  return apiCall<PlatformUser>('/api/users/sync', token, { method: 'POST' });
}

export async function getMe(token: string | null): Promise<PlatformUser> {
  return apiCall<PlatformUser>('/api/users/me', token);
}

export async function updateMe(token: string | null, data: Partial<PlatformUser>): Promise<PlatformUser> {
  return apiCall<PlatformUser>('/api/users/me', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getPublicUser(clerkId: string): Promise<PlatformUser> {
  return apiCall<PlatformUser>(`/api/users/${clerkId}`, null);
}

export async function followSheikh(token: string | null, clerkId: string): Promise<void> {
  await apiCall(`/api/users/${clerkId}/follow`, token, { method: 'POST' });
}

export async function unfollowSheikh(token: string | null, clerkId: string): Promise<void> {
  await apiCall(`/api/users/${clerkId}/follow`, token, { method: 'DELETE' });
}

export async function requestSheikh(token: string | null): Promise<void> {
  await apiCall('/api/users/request-sheikh', token, { method: 'POST' });
}

export async function getSheikhs(page = 1, search = ''): Promise<{ sheikhs: SheikhListItem[]; total: number; pages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: '12' });
  if (search) params.set('search', search);
  return apiCall(`/api/sheikhs?${params}`, null);
}

export async function getSheikhPublic(clerkId: string): Promise<PlatformUser & { courses: Course[] }> {
  return apiCall(`/api/sheikhs/${clerkId}/public`, null);
}

export async function getCourses(filters?: { sheikhId?: string; category?: string; page?: number }): Promise<{ courses: Course[]; total: number; pages: number }> {
  const params = new URLSearchParams();
  if (filters?.sheikhId) params.set('sheikhId', filters.sheikhId);
  if (filters?.category) params.set('category', filters.category);
  params.set('page', String(filters?.page || 1));
  return apiCall(`/api/courses?${params}`, null);
}

export async function getCourse(id: string): Promise<Course> {
  return apiCall(`/api/courses/${id}`, null);
}

export async function getCoursePublic(id: string): Promise<Course> {
  return apiCall(`/api/courses/${id}/public`, null);
}

export async function getCourseByPublicKey(key: string): Promise<Course> {
  return apiCall(`/api/courses/public/${key}`, null);
}

export async function createCourse(token: string | null, data: { title: string; description?: string; coverImage?: string; category?: string }): Promise<Course> {
  return apiCall('/api/courses', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateCourse(token: string | null, id: string, data: Partial<Course>): Promise<Course> {
  return apiCall(`/api/courses/${id}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(token: string | null, id: string): Promise<void> {
  await apiCall(`/api/courses/${id}`, token, { method: 'DELETE' });
}

export async function enrollCourse(token: string | null, id: string): Promise<void> {
  await apiCall(`/api/courses/${id}/enroll`, token, { method: 'POST' });
}

export async function createLecture(token: string | null, data: { sessionId: string; courseId?: string; title: string; description?: string }): Promise<Lecture> {
  return apiCall('/api/lectures', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getLecture(id: string): Promise<LectureWithSession> {
  return apiCall(`/api/lectures/${id}`, null);
}

export async function getLecturePublic(id: string): Promise<LectureWithSession> {
  return apiCall(`/api/lectures/${id}/public`, null);
}

export async function getLectureByPublicKey(key: string): Promise<LectureWithSession> {
  return apiCall(`/api/lectures/public/${key}`, null);
}

export async function deleteLecture(token: string | null, id: string): Promise<void> {
  await apiCall(`/api/lectures/${id}`, token, { method: 'DELETE' });
}

export async function markLectureComplete(token: string | null, id: string): Promise<void> {
  await apiCall(`/api/lectures/${id}/complete`, token, { method: 'POST' });
}

export async function getCourseProgress(token: string | null, courseId: string): Promise<CourseProgress> {
  return apiCall(`/api/progress/course/${courseId}`, token);
}

export async function getAdminStats(token: string | null): Promise<AdminStats> {
  return apiCall('/api/admin/stats', token);
}

export async function getPendingSheikhs(token: string | null): Promise<PlatformUser[]> {
  return apiCall('/api/admin/pending-sheikhs', token);
}

export async function approveSheikh(token: string | null, clerkId: string): Promise<void> {
  await apiCall(`/api/admin/sheikhs/${clerkId}/approve`, token, { method: 'PATCH' });
}

export async function rejectSheikh(token: string | null, clerkId: string): Promise<void> {
  await apiCall(`/api/admin/sheikhs/${clerkId}/reject`, token, { method: 'PATCH' });
}

export async function getAdminUsers(token: string | null, page = 1, role?: string): Promise<{ users: PlatformUser[]; total: number; pages: number }> {
  const params = new URLSearchParams({ page: String(page) });
  if (role) params.set('role', role);
  return apiCall(`/api/admin/users?${params}`, token);
}
