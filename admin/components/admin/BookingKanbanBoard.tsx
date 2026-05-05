'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COLUMNS = [
  { id: 'inquiry',         label: '1. Inquiry',        color: '#8B7355' },
  { id: 'curating',        label: '2. Curating',       color: '#1A3A7A' },
  { id: 'proposed',        label: '3. Proposed',       color: '#185FA5' },
  { id: 'host_pending',    label: '4. Host Pending',   color: '#C4714A' },
  { id: 'host_confirmed',  label: '5. Host OK',        color: '#7A2C5C' },
  { id: 'payment_pending', label: '6. Payment',        color: '#993556' },
  { id: 'paid',            label: '7. Paid',           color: '#4A7C59' },
  { id: 'booked',          label: '8. Booked',         color: '#0F6E56' },
  { id: 'checked_in',      label: '9. Checked In',     color: '#3B6D11' },
];

const PERSONA_EMOJI: Record<string, string> = {
  kpop: '🎤', language: '🗣️', wellness: '💆', workation: '💻', other: '✈️',
};

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function fmtDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function BookingCard({ booking, onDragStart }: { booking: any; onDragStart: () => void }) {
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const stayDays = daysBetween(checkIn, checkOut);
  const daysUntil = daysBetween(new Date(), checkIn);
  const isUrgent = daysUntil >= 0 && daysUntil <= 7 && booking.status !== 'checked_in';

  return (
    <Link href={`/admin/bookings/${booking.id}`}>
      <div
        draggable
        onDragStart={onDragStart}
        className="bg-white rounded-lg p-3 border border-[#E8E0D5] hover:border-[#C4714A] cursor-move transition-colors select-none"
        onClick={e => e.stopPropagation()}
      >
        {isUrgent && (
          <div className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full inline-block mb-1.5 font-medium">
            ⚠️ {daysUntil}d to check-in
          </div>
        )}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span>{PERSONA_EMOJI[booking.persona] ?? '✈️'}</span>
            <p className="font-medium text-sm text-[#2C2420] truncate max-w-[110px]">{booking.guest_name}</p>
          </div>
          <span className="text-[10px] text-[#A89880] font-mono flex-shrink-0">{booking.display_id}</span>
        </div>
        <p className="text-xs text-[#8B7355] mb-2">
          {fmtDate(booking.check_in_date)} → {fmtDate(booking.check_out_date)} · {stayDays}d
        </p>
        {booking.stay && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#F0E8DC]">
            {booking.stay.thumbnail_url && (
              <div className="w-7 h-7 rounded bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${booking.stay.thumbnail_url})` }} />
            )}
            <p className="text-xs text-[#5A4030] truncate">{booking.stay.name}</p>
          </div>
        )}
        {booking.total_charged_usd && (
          <div className="flex justify-between items-center pt-2 border-t border-[#F0E8DC] mt-2">
            <span className="text-xs text-[#8B7355]">Total</span>
            <span className="text-sm font-medium text-[#2C2420]">${booking.total_charged_usd}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function BookingKanbanBoard({ bookings: initial }: { bookings: any[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initial);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState('inquiry');

  useEffect(() => { setBookings(initial); }, [initial]);

  const handleDrop = async (newStatus: string) => {
    if (!draggedId) return;
    const booking = bookings.find(b => b.id === draggedId);
    if (!booking || booking.status === newStatus) { setDraggedId(null); return; }

    setBookings(prev => prev.map(b => b.id === draggedId ? { ...b, status: newStatus } : b));
    const res = await fetch(`/api/admin/bookings/${draggedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) router.refresh();
    setDraggedId(null);
  };

  return (
    <>
      {/* Desktop kanban */}
      <div className="hidden md:block overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => {
            const cards = bookings.filter(b => b.status === col.id);
            return (
              <div key={col.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="bg-[#F5F0EB] rounded-xl p-3 flex-shrink-0"
                style={{ width: 260 }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-sm font-medium" style={{ color: col.color }}>{col.label}</p>
                  <span className="text-xs text-[#8B7355] bg-white px-1.5 py-0.5 rounded">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map(b => (
                    <BookingCard key={b.id} booking={b} onDragStart={() => setDraggedId(b.id)} />
                  ))}
                  {cards.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#A89880]">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {COLUMNS.map(col => (
            <button key={col.id} onClick={() => setActiveStatus(col.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeStatus === col.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#5A4030] border-[#E8E0D5]'
              }`}
              style={activeStatus === col.id ? { backgroundColor: col.color, borderColor: col.color } : {}}>
              {col.label.split('. ')[1]} ({bookings.filter(b => b.status === col.id).length})
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {bookings.filter(b => b.status === activeStatus).map(b => (
            <BookingCard key={b.id} booking={b} onDragStart={() => {}} />
          ))}
          {bookings.filter(b => b.status === activeStatus).length === 0 && (
            <div className="text-center py-12 text-sm text-[#8B7355]">No requests in this stage</div>
          )}
        </div>
      </div>
    </>
  );
}
