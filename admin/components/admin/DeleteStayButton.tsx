'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteStayButton({ stayId, stayName }: { stayId: string; stayName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/admin/stays/${stayId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete stay');
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-[#5A4030]">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:underline font-semibold"
        >
          {deleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[#8B7355] hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-500 hover:text-red-700 hover:underline text-sm transition-colors"
    >
      Delete
    </button>
  );
}
