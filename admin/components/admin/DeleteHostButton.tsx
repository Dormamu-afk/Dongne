'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteHostButton({ hostId, hostName }: { hostId: string; hostName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete host "${hostName}"? Their stays will be unlinked.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/hosts/${hostId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button onClick={handleDelete} disabled={deleting}
      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-40 transition-colors">
      {deleting ? '...' : 'Delete'}
    </button>
  );
}
