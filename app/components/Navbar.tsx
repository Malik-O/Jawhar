'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconMenu, IconX } from './Icons';
import { useUserRole } from '../hooks/useUserRole';

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, isSheikh } = useUserRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const studentLinks = [
    { href: '/', label: 'اكتشاف' },
    { href: '/my-courses', label: 'دوراتي' },
    { href: '/profile', label: 'ملفي' },
  ];

  const sheikhLinks = [
    { href: '/', label: 'مساحة العمل' },
    { href: '/upload', label: 'رفع محاضرة' },
    { href: '/profile', label: 'ملفي' },
  ];

  const links = isSheikh ? sheikhLinks : studentLinks;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#101010]/95 backdrop-blur-sm border-b border-white/[0.08] safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold" style={{
              background: 'linear-gradient(135deg, #FFB74D, #FF9800, #E65100)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              جَوْهَر
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm transition-colors ${isActive(l.href) ? 'text-[#FF9800]' : 'text-[#B0B0B0] hover:text-[#E0E0E0]'}`}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className={`text-sm transition-colors ${isActive('/admin') ? 'text-[#FF9800]' : 'text-[#B0B0B0] hover:text-[#E0E0E0]'}`}>
                  لوحة الإدارة
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {/* UserButton moved to SessionHistory */}
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-[8px] text-[#B0B0B0] border border-white/10"
            >
              {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden border-t border-white/[0.08] px-4 py-3 space-y-2 bg-[#161616]">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm ${isActive(l.href) ? 'text-[#FF9800]' : 'text-[#B0B0B0]'}`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-[#B0B0B0]">
                لوحة الإدارة
              </Link>
            )}
            <div className="pt-2 border-t border-white/[0.08]">
              {/* UserButton moved to SessionHistory */}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
