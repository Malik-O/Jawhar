import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Amiri } from 'next/font/google';
import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-quran',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'جَوْهَر — تحويل المحاضرات إلى ملخصات بالذكاء الاصطناعي',
  description:
    'جَوْهَر: أداة مجانية لتحويل المحاضرات الصوتية والمرئية إلى ملخصات منظمة باللغة العربية باستخدام الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} ${amiri.variable}`}>
      <body>{children}</body>
    </html>
  );
}
