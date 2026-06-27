import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة دورة جديدة | جَوْهَر',
};

export default function CourseNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
