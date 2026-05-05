'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BookingStayLinker({ bookingId, currentStayId }: { bookingId: string; currentStayId: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/stays?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const link = async (stayId: string) => {
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stay_id: stayId }),
    });
    setOpen(false); setQuery(''); setResults([]);
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs text-[#C4714A] hover:underline">
        {currentStayId ? 'Change stay' : '+ Link stay'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-[#2C2420]">Link a stay</h3>
              <button onClick={() => setOpen(false)} className="text-[#8B7355] hover:text-[#2C2420]">✕</button>
            </div>
            <input autoFocus type="text" placeholder="Search by name or neighborhood..."
              value={query} onChange={e => search(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm mb-3 focus:border-[#C4714A] focus:outline-none" />
            <div className="max-h-80 overflow-y-auto space-y-1">
              {loading && <p className="text-xs text-[#8B7355] px-2">Searching...</p>}
              {!loading && query.length >= 2 && results.length === 0 && (
                <p className="text-xs text-[#A89880] px-2">No stays found</p>
              )}
              {results.map(s => (
                <button key={s.id} onClick={() => link(s.id)}
                  className="w-full flex gap-3 p-2 rounded-lg hover:bg-[#FAF7F2] text-left items-center">
                  {s.thumbnail_url && (
                    <div className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${s.thumbnail_url})` }} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2C2420]">{s.name}</p>
                    <p className="text-xs text-[#8B7355]">{s.neighborhood_id} · ${s.price_per_week_usd}/wk
                      {!s.is_published && <span className="text-orange-500 ml-1">(unpublished)</span>}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
