'use client';

import { PlatformUser } from '@/app/types/platform';

interface UsersTableProps {
  users: PlatformUser[];
}

export default function UsersTable({ users }: UsersTableProps) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-[#808080]">لا يوجد مستخدمين</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">كل المستخدمين</h2>
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="text-[#808080] border-b border-white/10">
            <th className="pb-3 px-4">الاسم</th>
            <th className="pb-3 px-4">البريد الإلكتروني</th>
            <th className="pb-3 px-4">الدور</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.clerkId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <td className="py-3 px-4 text-[#E0E0E0]">{user.name}</td>
              <td className="py-3 px-4 text-[#B0B0B0]">{user.email}</td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-1 rounded text-xs border ${
                  user.role === 'super_admin' ? 'bg-[#ff3333]/10 border-[#ff3333]/20 text-[#ff3333]' :
                  user.role === 'sheikh' ? 'bg-[#FF9800]/10 border-[#FF9800]/20 text-[#FF9800]' :
                  'bg-[#00C8C8]/10 border-[#00C8C8]/20 text-[#00C8C8]'
                }`}>
                  {user.role === 'super_admin' ? 'مدير' : user.role === 'sheikh' ? 'شيخ' : 'طالب'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
