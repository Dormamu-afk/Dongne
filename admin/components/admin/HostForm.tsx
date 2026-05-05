'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ENGLISH_LEVELS = [
  { value: 'none', label: '🔴 None' },
  { value: 'basic', label: '🟠 Basic' },
  { value: 'intermediate', label: '🟡 Intermediate' },
  { value: 'fluent', label: '🟢 Fluent' },
];

interface HostFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

export function HostForm({ initialData, mode }: HostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    name_ko: initialData?.name_ko ?? '',
    kakao_id: initialData?.kakao_id ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    speaks_english: initialData?.speaks_english ?? false,
    english_level: initialData?.english_level ?? 'none',
    accepts_foreigners: initialData?.accepts_foreigners ?? true,
    foreigner_acceptance_notes: initialData?.foreigner_acceptance_notes ?? '',
    reliability_score: initialData?.reliability_score ?? 3,
    source_host_id: initialData?.source_host_id ?? '',
    notes: initialData?.notes ?? '',
    is_active: initialData?.is_active ?? true,
  });

  const update = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#2C2420] focus:border-[#C4714A] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    const url = mode === 'create' ? '/api/admin/hosts' : `/api/admin/hosts/${initialData.id}`;
    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, reliability_score: Number(form.reliability_score) }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed to save');
      setSaving(false); return;
    }
    router.push('/admin/hosts'); router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <h2 className="font-medium text-[#2C2420] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Basic info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-[#5A4030] mb-1">Name (English) *</label>
            <input required value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="Kim Jisoo" className={inputCls} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-[#5A4030] mb-1">Name (Korean)</label>
            <input value={form.name_ko} onChange={e => update('name_ko', e.target.value)}
              placeholder="김지수" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-1">KakaoTalk ID</label>
            <input value={form.kakao_id} onChange={e => update('kakao_id', e.target.value)}
              placeholder="kakao_id" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-1">Phone</label>
            <input value={form.phone} onChange={e => update('phone', e.target.value)}
              placeholder="+82 10-0000-0000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="host@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-1">33m2 Host ID</label>
            <input value={form.source_host_id} onChange={e => update('source_host_id', e.target.value)}
              placeholder="33m2 내부 ID" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <h2 className="font-medium text-[#2C2420] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Communication</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-2">English level</label>
            <div className="flex gap-2 flex-wrap">
              {ENGLISH_LEVELS.map(l => (
                <button key={l.value} type="button" onClick={() => { update('english_level', l.value); update('speaks_english', l.value !== 'none'); }}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    form.english_level === l.value
                      ? 'bg-[#C4714A] text-white border-[#C4714A]'
                      : 'bg-white text-[#5A4030] border-[#E8E0D5] hover:border-[#C4714A]'
                  }`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.accepts_foreigners}
              onChange={e => update('accepts_foreigners', e.target.checked)}
              className="w-4 h-4 accent-[#C4714A]" />
            <span className="text-sm text-[#2C2420]">Accepts foreign guests</span>
          </label>
          {!form.accepts_foreigners && (
            <div>
              <label className="block text-xs font-medium text-[#5A4030] mb-1">Notes on acceptance</label>
              <input value={form.foreigner_acceptance_notes}
                onChange={e => update('foreigner_acceptance_notes', e.target.value)}
                placeholder="e.g. Korean-speaking guests only" className={inputCls} />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <h2 className="font-medium text-[#2C2420] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Reliability</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-2">
              Reliability score: {form.reliability_score}/5
            </label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => update('reliability_score', n)}
                  className={`w-9 h-9 rounded-full border text-sm font-medium transition-all ${
                    form.reliability_score >= n
                      ? 'bg-[#C4714A] text-white border-[#C4714A]'
                      : 'bg-white text-[#8B7355] border-[#E8E0D5]'
                  }`}>
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4030] mb-1">Internal notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
              rows={3} placeholder="Operator notes about this host..."
              className={`${inputCls} resize-y`} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active}
            onChange={e => update('is_active', e.target.checked)}
            className="w-4 h-4 accent-[#C4714A]" />
          <span className="text-sm text-[#2C2420] font-medium">Active host</span>
          <span className="text-xs text-[#8B7355]">(inactive hosts won't appear in stay dropdowns)</span>
        </label>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 sticky bottom-4 bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-md">
        <button type="button" onClick={() => router.push('/admin/hosts')}
          className="px-5 py-2.5 border border-[#E8E0D5] text-[#5A4030] rounded-lg text-sm font-medium hover:bg-[#F5F0EB]">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] disabled:opacity-50">
          {saving ? 'Saving...' : mode === 'create' ? 'Create host' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
