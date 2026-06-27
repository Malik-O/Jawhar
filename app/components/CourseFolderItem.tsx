'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Course } from '../types/platform';
import { IconFolder, IconFolderOpen, IconChevronLeft, IconNote, IconShare } from './Icons';
import CopyLinkButton from './CopyLinkButton';

interface CourseFolderItemProps {
  course: Course;
  isActiveSessionId?: string;
  onSelectLecture?: (sessionId: string) => void;
}

export default function CourseFolderItem({ course, isActiveSessionId, onSelectLecture }: CourseFolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any child lecture is the active session
  const hasActiveChild = course.lectures.some(l => l.sessionId === isActiveSessionId);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-3 w-full p-2.5 rounded-[10px] border transition-all text-right group cursor-pointer select-none ${hasActiveChild && !isExpanded ? 'bg-[#FF9800]/[0.08] border-[#FF9800]/20' : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'}`}
      >
        <span className={`flex transition-colors ${isExpanded || hasActiveChild ? 'text-[#FF9800]' : 'text-[#808080] group-hover:text-[#B0B0B0]'}`}>
          {isExpanded ? <IconFolderOpen size={18} /> : <IconFolder size={18} />}
        </span>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[0.85rem] font-medium text-[#E0E0E0] whitespace-nowrap overflow-hidden text-ellipsis">
            {course.title}
          </span>
          <span className="text-[0.72rem] text-[#808080]">
            {course.lectures.length} محاضرات
          </span>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1" onClick={e => e.stopPropagation()}>
           {course.publicKey && (
             <CopyLinkButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/c/${course.publicKey}`} size="sm" />
           )}
        </div>

        <span className={`text-[#808080] transition-transform duration-200 ${isExpanded ? '-rotate-90' : 'rotate-0'}`}>
          <IconChevronLeft size={16} />
        </span>
      </div>

      {isExpanded && course.lectures.length > 0 && (
        <ul className="flex flex-col gap-1 pr-6 pb-2 border-r border-white/[0.08] mr-3 mt-1 animate-slide-up origin-top">
          {course.lectures.map(lecture => {
            const isActive = lecture.sessionId === isActiveSessionId;
            const content = (
              <>
                <span className={`flex transition-colors ${isActive ? 'text-[#FF9800]' : 'text-[#808080] group-hover:text-[#B0B0B0]'}`}>
                  <IconNote size={15} />
                </span>
                <span className="text-[0.8rem] font-medium text-[#E0E0E0] whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                  {lecture.title}
                </span>
                {lecture.publicKey && (
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
                      <CopyLinkButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/l/${lecture.publicKey}`} size="sm" />
                   </div>
                )}
              </>
            );

            const className = `flex items-center gap-2.5 w-full p-2 rounded-[8px] border transition-all text-right group ${isActive ? 'bg-[#FF9800]/[0.08] border-[#FF9800]/20' : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'}`;

            return (
              <li key={lecture._id}>
                {onSelectLecture ? (
                  <button onClick={() => onSelectLecture(lecture.sessionId)} className={className}>
                    {content}
                  </button>
                ) : (
                  <Link href={`/history/${lecture.sessionId}`} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
