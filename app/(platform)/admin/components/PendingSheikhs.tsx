'use client';

import { PlatformUser } from '@/app/types/platform';

interface PendingSheikhsProps {
  pendingSheikhs: PlatformUser[];
  handleApprove: (clerkId: string) => void;
  handleReject: (clerkId: string) => void;
  actionLoading: string | null;
}

export default function PendingSheikhs({ pendingSheikhs, handleApprove, handleReject, actionLoading }: PendingSheikhsProps) {
  if (!pendingSheikhs || pendingSheikhs.length === 0) {
    return (
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 mb-8 text-center">
        <p className="text-[#808080]">لا توجد طلبات اعتماد معلقة</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 mb-8 overflow-x-auto">
      <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">طلبات الاعتماد المعلقة</h2>
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="text-[#808080] border-b border-white/10">
            <th className="pb-3 px-4">الاسم</th>
            <th className="pb-3 px-4">البريد الإلكتروني</th>
            <th className="pb-3 px-4 text-center">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {pendingSheikhs.map((user) => (
            <tr key={user.clerkId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <td className="py-3 px-4 text-[#E0E0E0] font-medium">{user.name}</td>
              <td className="py-3 px-4 text-[#B0B0B0]">{user.email}</td>
              <td className="py-3 px-4 text-center space-x-2 space-x-reverse">
                <button
                  onClick={() => handleApprove(user.clerkId)}
                  disabled={!!actionLoading}
                  className="px-3 py-1 bg-[#00C8C8]/10 text-[#00C8C8] border border-[#00C8C8]/20 rounded hover:bg-[#00C8C8]/20 transition-colors text-xs disabled:opacity-50"
                >
                  {actionLoading === `approve-${user.clerkId}` ? 'جاري...' : 'قبول'}
                </button>
                <button
                  onClick={() => handleReject(user.clerkId)}
                  disabled={!!actionLoading}
                  className="px-3 py-1 bg-[#ff3333]/10 text-[#ff3333] border border-[#ff3333]/20 rounded hover:bg-[#ff3333]/20 transition-colors text-xs disabled:opacity-50"
                >
                  {actionLoading === `reject-${user.clerkId}` ? 'جاري...' : 'رفض'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
