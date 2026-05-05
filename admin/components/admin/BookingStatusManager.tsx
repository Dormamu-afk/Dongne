'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = [
  { id: 'inquiry',         label: 'Inquiry',         color: '#8B7355' },
  { id: 'curating',        label: 'Curating',        color: '#1A3A7A' },
  { id: 'proposed',        label: 'Proposed',        color: '#185FA5' },
  { id: 'host_pending',    label: 'Host Pending',    color: '#C4714A' },
  { id: 'host_confirmed',  label: 'Host OK',         color: '#7A2C5C' },
  { id: 'payment_pending', label: 'Payment Pending', color: '#993556' },
  { id: 'paid',            label: 'Paid',            color: '#4A7C59' },
  { id: 'booked',          label: 'Booked',          color: '#0F6E56' },
  { id: 'checked_in',      label: 'Checked In',      color: '#3B6D11' },
  { id: 'completed',       label: 'Completed',       color: '#5F5E5A' },
  { id: 'cancelled',       label: 'Cancelled',       color: '#791F1F' },
  { id: 'rejected',        label: 'Rejected',        color: '#A32D2D' },
];

export function BookingStatusManager({ booking }: { booking: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const current = STATUSES.find(s => s.id === booking.status) ?? STATUSES[0];

  const handleChange = async (newStatus: string) => {
    setUpdating(true); setOpen(false);
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setUpdating(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={updating}
        className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all min-w-[140px]"
        style={{ borderColor: current.color, color: current.color, backgroundColor: `${current.color}15` }}>
        {updating ? 'Updating...' : `${current.label} ▾`}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E0D5] rounded-lg shadow-lg z-20 min-w-[180px] py-1">
            {STATUSES.map(s => (
              <button key={s.id} onClick={() => handleChange(s.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#FAF7F2] flex items-center gap-2"
                style={{ color: s.id === current.id ? s.color : '#2C2420', fontWeight: s.id === current.id ? 600 : 400 }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
                {s.id === current.id && ' ✓'}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
