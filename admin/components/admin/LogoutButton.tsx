'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-[#5A4030] hover:text-[#2C2420] px-2 py-1 rounded hover:bg-[#F5F0EB] transition-colors"
    >
      Sign out
    </button>
  );
}
