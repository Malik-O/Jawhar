import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مُلخّص المحاضرات - تحويل الصوت لملخص بالذكاء الاصطناعي',
  description:
    'أداة مجانية لتحويل المحاضرات الصوتية والمرئية إلى ملخصات منظمة باللغة العربية باستخدام الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <body>{children}</body>
    </html>
  );
}
