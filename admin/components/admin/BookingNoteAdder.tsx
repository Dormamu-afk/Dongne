'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BookingNoteAdder({ bookingId, initialNotes }: { bookingId: string; initialNotes: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internal_notes: notes }),
    });
    setSaving(false); setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <textarea value={notes} onChange={e => { setNotes(e.target.value); setSaved(false); }}
        rows={4} placeholder="Notes visible only to you..."
        className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#2C2420] focus:border-[#C4714A] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/10 resize-y" />
      <div className="flex justify-end mt-2">
        {saved && <span className="text-xs text-green-600 mr-3 self-center">Saved ✓</span>}
        <button onClick={handleSave} disabled={saving || notes === initialNotes}
          className="px-4 py-1.5 bg-[#2C2420] text-white text-sm rounded-lg hover:bg-[#C4714A] disabled:opacity-40 transition-colors">
          {saving ? 'Saving...' : 'Save notes'}
        </button>
      </div>
    </div>
  );
}
