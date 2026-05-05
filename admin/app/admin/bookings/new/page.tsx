'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PERSONA_OPTIONS = [
  { value: 'kpop', label: '🎤 K-pop fan' },
  { value: 'language', label: '🗣️ Language learner' },
  { value: 'wellness', label: '💆 Wellness' },
  { value: 'workation', label: '💻 Workation' },
  { value: 'other', label: '✈️ Other' },
];

export default function NewBookingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    guest_kakao_id: '', guest_country: '', guest_count: 1,
    persona: '', check_in_date: '', check_out_date: '',
    internal_notes: '',
  });

  const update = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#2C2420] focus:border-[#C4714A] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, guest_count: Number(form.guest_count) }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed to create');
      setSaving(false); return;
    }
    const data = await res.json();
    router.push(`/admin/bookings/${data.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin" className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-4 inline-block">
        ← Back to bookings
      </Link>
      <h1 className="text-3xl text-[#2C2420] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
        New booking request
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
          <h2 className="font-medium text-[#2C2420] mb-4">Guest info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Name *</label>
              <input required value={form.guest_name} onChange={e => update('guest_name', e.target.value)}
                placeholder="Jane Smith" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Email *</label>
              <input required type="email" value={form.guest_email} onChange={e => update('guest_email', e.target.value)}
                placeholder="jane@example.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Phone</label>
              <input value={form.guest_phone} onChange={e => update('guest_phone', e.target.value)}
                placeholder="+1 555 0100" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">KakaoTalk ID</label>
              <input value={form.guest_kakao_id} onChange={e => update('guest_kakao_id', e.target.value)}
                placeholder="kakao123" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Country</label>
              <input value={form.guest_country} onChange={e => update('guest_country', e.target.value)}
                placeholder="USA" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Guests</label>
              <input type="number" min={1} value={form.guest_count}
                onChange={e => update('guest_count', e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Persona</label>
              <div className="flex flex-wrap gap-2">
                {PERSONA_OPTIONS.map(p => (
                  <button key={p.value} type="button" onClick={() => update('persona', p.value)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      form.persona === p.value
                        ? 'bg-[#C4714A] text-white border-[#C4714A]'
                        : 'bg-white text-[#5A4030] border-[#E8E0D5] hover:border-[#C4714A]'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
          <h2 className="font-medium text-[#2C2420] mb-4">Stay dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Check-in *</label>
              <input required type="date" value={form.check_in_date}
                onChange={e => update('check_in_date', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Check-out *</label>
              <input required type="date" value={form.check_out_date}
                onChange={e => update('check_out_date', e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
          <h2 className="font-medium text-[#2C2420] mb-2">Internal notes</h2>
          <textarea value={form.internal_notes} onChange={e => update('internal_notes', e.target.value)}
            rows={3} placeholder="Notes visible only to you..."
            className={`${inputCls} resize-y`} />
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3">
          <Link href="/admin">
            <button type="button"
              className="px-5 py-2.5 border border-[#E8E0D5] text-[#5A4030] rounded-lg text-sm font-medium hover:bg-[#F5F0EB]">
              Cancel
            </button>
          </Link>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] disabled:opacity-50">
            {saving ? 'Creating...' : 'Create request'}
          </button>
        </div>
      </form>
    </div>
  );
}
