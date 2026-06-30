'use client';

import SheikhOnly from '@/app/components/SheikhOnly';
import CourseForm from './components/CourseForm';

export default function CreateCoursePage() {
  return (
    <SheikhOnly>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-[#E0E0E0]">إنشاء دورة جديدة</h1>
          <p className="text-[#808080] text-sm mt-1">أضف تفاصيل الدورة للبدء بنشر المحاضرات فيها</p>
        </header>

        <CourseForm />
      </div>
    </SheikhOnly>
  );
}
