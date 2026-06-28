'use client';

import { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { BookOpen, Award } from 'lucide-react'; // Make sure lucide-react is available, or use plain SVGs

export default function SignUpPage() {
  const [role, setRole] = useState<'student' | 'sheikh' | null>(null);

  if (!role) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101010] text-white selection:bg-[#FF9800]/30 font-sans" dir="rtl">
        {/* Ambient Background for Selection */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF9800]/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-sm pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              أهلاً بك في جَوْهَر
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">
              اختر نوع الحساب الذي ترغب في إنشائه للمتابعة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* Student Card */}
            <button
              onClick={() => setRole('student')}
              className="group relative flex flex-col items-center p-8 rounded-3xl bg-[#161616] border border-white/5 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all duration-300 overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">طالب علم</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                انضم لتتعلم وتستفيد من شروحات المشايخ وتتابع مسيرتك التعليمية.
              </p>
              <div className="mt-6 px-6 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                متابعة كطالب
              </div>
            </button>

            {/* Sheikh Card */}
            <button
              onClick={() => setRole('sheikh')}
              className="group relative flex flex-col items-center p-8 rounded-3xl bg-[#161616] border border-white/5 hover:border-[#FF9800]/50 hover:bg-[#1a1a1a] transition-all duration-300 overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9800]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 rounded-2xl bg-[#FF9800]/10 text-[#FF9800] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">شيخ / معلم</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                أنشئ دوراتك وارفع محاضراتك لتصل إلى طلاب العلم حول العالم.
              </p>
              <div className="mt-6 px-6 py-2 rounded-full bg-[#FF9800]/10 text-[#FF9800] text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                متابعة كشيخ
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Background Colors based on Role
  const isSheikh = role === 'sheikh';
  const primaryColor = isSheikh ? '#FF9800' : '#3b82f6'; // Orange for Sheikh, Blue for Student
  const secondaryColor = isSheikh ? '#E65100' : '#2563eb';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101010]" dir="rtl">
      {/* Background Orbs dynamic to role */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000" 
        style={{ backgroundColor: `${primaryColor}20` }} // 20 is ~12% opacity in hex
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000" 
        style={{ backgroundColor: `${secondaryColor}20` }}
      />

      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[12px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        {/* Back Button */}
        <button 
          onClick={() => setRole(null)}
          className="self-start mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <span>&rarr;</span> العودة لاختيار الحساب
        </button>

        <SignUp
          unsafeMetadata={{ role }}
          appearance={{
            elements: {
              rootBox: { width: '100%', direction: 'rtl' },
              card: {
                background: 'rgba(22,22,22,0.80)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.05)',
              },
              headerTitle: {
                color: '#fff',
              },
              headerSubtitle: {
                color: '#aaa',
              },
              socialButtonsBlockButton: {
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }
              },
              socialButtonsBlockButtonText: {
                color: '#fff',
              },
              dividerLine: {
                background: 'rgba(255,255,255,0.1)',
              },
              dividerText: {
                color: '#888',
              },
              formFieldLabel: {
                color: '#ccc',
              },
              formFieldInput: {
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              },
              footerActionText: {
                color: '#888',
              },
              footerActionLink: {
                color: primaryColor,
                '&:hover': {
                  color: secondaryColor,
                }
              },
              formButtonPrimary: {
                backgroundColor: primaryColor,
                '&:hover': {
                  backgroundColor: secondaryColor,
                }
              }
            },
          }}
        />
      </div>
    </div>
  );
}
