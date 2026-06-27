export type UserRole = 'student' | 'sheikh' | 'super_admin';
export type SheikhStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface PlatformUser {
  _id: string;
  clerkId: string;
  email?: string;
  name: string;
  role: UserRole;
  sheikhStatus: SheikhStatus;
  bio: string;
  profileImage: string;
  coverImage: string;
  followers: string[];
  following: string[];
  createdAt?: string;
}

export interface SheikhListItem {
  clerkId: string;
  name: string;
  bio: string;
  profileImage: string;
  followers: string[];
}

export interface Course {
  _id: string;
  sheikhId: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  lectures: Lecture[];
  enrolledStudents: string[];
  publicKey: string;
  createdAt?: string;
}

export interface Lecture {
  _id: string;
  sheikhId: string;
  courseId: string | null;
  sessionId: string;
  title: string;
  description: string;
  order: number;
  publicKey: string;
  createdAt?: string;
}

export interface LectureWithSession extends Lecture {
  session?: {
    _id: string;
    title: string;
    summary: string;
    keyPoints: string[];
    transcript: string;
    quranVerses: QuranVerse[];
    duration: number;
    publicKey: string;
  };
}

export interface QuranVerse {
  ref: string;
  surah: number;
  ayah: number;
  surahName: string;
  uthmani: string;
  transcriptText: string;
}

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
  lectures: { lectureId: string; completed: boolean }[];
}

export interface AdminStats {
  users: number;
  sheikhs: number;
  pending: number;
  courses: number;
  lectures: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
