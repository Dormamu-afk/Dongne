'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { HostSelector } from '@/components/admin/HostSelector';

interface StayFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  mode: 'create' | 'edit';
}

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Washer', 'Dryer', 'AC', 'Heating',
  'Workspace', 'TV', 'Hair dryer', 'Iron', 'Elevator', 'Parking',
  'Pool', 'Gym', 'Rooftop', 'Concierge', 'Daily cleaning',
];

export function StayForm({ initialData, mode }: StayFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    host_id:            initialData?.host_id            ?? null,
    name:               initialData?.name               ?? '',
    name_ko:            initialData?.name_ko            ?? '',
    neighborhood_id:    initialData?.neighborhood_id    ?? '',
    price_per_week_usd: initialData?.price_per_week_usd ?? '',
    price_per_2week_usd:initialData?.price_per_2week_usd ?? '',
    price_per_month_usd:initialData?.price_per_month_usd ?? '',
    deposit_krw:        initialData?.deposit_krw        ?? '',
    thumbnail_url:      initialData?.thumbnail_url      ?? '',
    image_urls:         (initialData?.image_urls ?? []).join('\n'),
    description:        initialData?.description        ?? '',
    description_ko:     initialData?.description_ko     ?? '',
    address:            initialData?.address            ?? '',
    address_ko:         initialData?.address_ko         ?? '',
    size_sqm:           initialData?.size_sqm           ?? '',
    max_guests:         initialData?.max_guests         ?? 1,
    bedrooms:           initialData?.bedrooms           ?? 0,
    bathrooms:          initialData?.bathrooms          ?? 1,
    amenities:         (initialData?.amenities          ?? []) as string[],
    source_url:         initialData?.source_url         ?? '',
    is_published:       initialData?.is_published       ?? true,
    is_featured:        initialData?.is_featured        ?? false,
    lat:                initialData?.lat                ?? '',
    lng:                initialData?.lng                ?? '',
  });

  const update = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleAmenity = (a: string) =>
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.name || !form.neighborhood_id || !form.price_per_week_usd || !form.thumbnail_url) {
      setError('Name, neighborhood, price/week, and thumbnail URL are required.');
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      price_per_week_usd:  parseInt(String(form.price_per_week_usd)),
      price_per_2week_usd: form.price_per_2week_usd ? parseInt(String(form.price_per_2week_usd)) : null,
      price_per_month_usd: form.price_per_month_usd ? parseInt(String(form.price_per_month_usd)) : null,
      deposit_krw:         form.deposit_krw ? parseInt(String(form.deposit_krw)) : null,
      size_sqm:            form.size_sqm ? parseInt(String(form.size_sqm)) : null,
      max_guests:          parseInt(String(form.max_guests)),
      bedrooms:            parseInt(String(form.bedrooms)),
      bathrooms:           parseInt(String(form.bathrooms)),
      lat:                 form.lat ? parseFloat(String(form.lat)) : null,
      lng:                 form.lng ? parseFloat(String(form.lng)) : null,
      image_urls:          form.image_urls
                             ? form.image_urls.split('\n').map((u: string) => u.trim()).filter(Boolean)
                             : [],
    };

    const url    = mode === 'create' ? '/api/admin/stays' : `/api/admin/stays/${initialData.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to save. Check console for details.');
      setSaving(false);
      return;
    }

    router.push('/admin/stays');
    router.refresh();
  };

  const Field = ({ label, required = false, children, hint }: {
    label: string; required?: boolean; children: React.ReactNode; hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-[#2C2420] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#8B7355] mt-1">{hint}</p>}
    </div>
  );

  const inputCls = "w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#2C2420] focus:border-[#C4714A] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/10 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ─── Essential info ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-6">
        <h2 className="text-xl text-[#2C2420] font-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>
          Essential info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name (English)" required>
            <input value={form.name} onChange={e => update('name', e.target.value)}
              required placeholder="Yeonnam Cozy Studio" className={inputCls} />
          </Field>

          <Field label="Name (Korean)">
            <input value={form.name_ko} onChange={e => update('name_ko', e.target.value)}
              placeholder="연남동 코지 스튜디오" className={inputCls} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Host">
              <HostSelector value={form.host_id} onChange={id => update('host_id', id)} />
            </Field>
          </div>

          <Field label="Neighborhood" required>
            <select value={form.neighborhood_id} onChange={e => update('neighborhood_id', e.target.value)}
              required className={inputCls}>
              <option value="">Select neighborhood...</option>
              {NEIGHBORHOODS.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.nameKo})</option>
              ))}
            </select>
          </Field>

          <Field label="Price per week (USD)" required>
            <input type="number" value={form.price_per_week_usd}
              onChange={e => update('price_per_week_usd', e.target.value)}
              required placeholder="350" min={1} className={inputCls} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Thumbnail URL" required
              hint="Tip: Right-click image on 33m2 → Copy image address">
              <input type="url" value={form.thumbnail_url}
                onChange={e => update('thumbnail_url', e.target.value)}
                required placeholder="https://33m2.co.kr/.../image.jpg" className={inputCls} />
            </Field>
            {form.thumbnail_url && (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.thumbnail_url} alt="Preview"
                  className="w-32 h-24 object-cover rounded-lg border border-[#E8E0D5]"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <p className="text-xs text-green-600">✓ Preview loaded</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-6">
        <h2 className="text-xl text-[#2C2420] font-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>
          Pricing options
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Per 2 weeks (USD)">
            <input type="number" value={form.price_per_2week_usd}
              onChange={e => update('price_per_2week_usd', e.target.value)}
              placeholder="650" min={1} className={inputCls} />
          </Field>
          <Field label="Per month (USD)">
            <input type="number" value={form.price_per_month_usd}
              onChange={e => update('price_per_month_usd', e.target.value)}
              placeholder="1200" min={1} className={inputCls} />
          </Field>
          <Field label="Deposit (KRW)">
            <input type="number" value={form.deposit_krw}
              onChange={e => update('deposit_krw', e.target.value)}
              placeholder="330000" className={inputCls} />
          </Field>
        </div>
      </section>

      {/* ─── Property details ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-6">
        <h2 className="text-xl text-[#2C2420] font-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>
          Property details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Field label="Size (sqm)">
            <input type="number" value={form.size_sqm}
              onChange={e => update('size_sqm', e.target.value)}
              placeholder="20" className={inputCls} />
          </Field>
          <Field label="Max guests">
            <input type="number" value={form.max_guests}
              onChange={e => update('max_guests', e.target.value)}
              min={1} className={inputCls} />
          </Field>
          <Field label="Bedrooms">
            <input type="number" value={form.bedrooms}
              onChange={e => update('bedrooms', e.target.value)}
              min={0} className={inputCls} />
          </Field>
          <Field label="Bathrooms">
            <input type="number" value={form.bathrooms}
              onChange={e => update('bathrooms', e.target.value)}
              min={1} className={inputCls} />
          </Field>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2420] mb-2">
            Amenities <span className="text-xs text-[#8B7355] font-normal">({form.amenities.length} selected)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  form.amenities.includes(a)
                    ? 'bg-[#C4714A] text-white border-[#C4714A] shadow-sm'
                    : 'bg-white text-[#5A4030] border-[#E8E0D5] hover:border-[#C4714A] hover:text-[#C4714A]'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Description ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-6">
        <h2 className="text-xl text-[#2C2420] font-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>
          Description
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="English">
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={5} placeholder="A cozy studio in the heart of Yeonnam..."
              className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Korean">
            <textarea value={form.description_ko} onChange={e => update('description_ko', e.target.value)}
              rows={5} placeholder="연남동 중심에 위치한..."
              className={`${inputCls} resize-y`} />
          </Field>
        </div>
      </section>

      {/* ─── Advanced (collapsible) ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#FAF7F2] transition-colors">
          <h2 className="text-xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Advanced
          </h2>
          <span className="text-[#C4714A] text-xl font-light">{showAdvanced ? '−' : '+'}</span>
        </button>

        {showAdvanced && (
          <div className="px-6 pb-6 pt-5 space-y-4 border-t border-[#E8E0D5]">
            <Field label="Additional image URLs" hint="One per line, max 8 images">
              <textarea value={form.image_urls} onChange={e => update('image_urls', e.target.value)}
                rows={4} placeholder={'https://cdn.33m2.co.kr/...\nhttps://cdn.33m2.co.kr/...'}
                className={`${inputCls} font-mono text-xs resize-y`} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address (English)">
                <input value={form.address} onChange={e => update('address', e.target.value)}
                  placeholder="270 Donggyo-ro, Mapo-gu, Seoul" className={inputCls} />
              </Field>
              <Field label="Address (Korean)">
                <input value={form.address_ko} onChange={e => update('address_ko', e.target.value)}
                  placeholder="서울시 마포구 동교로 270" className={inputCls} />
              </Field>
              <Field label="Latitude">
                <input type="number" step="0.0000001" value={form.lat}
                  onChange={e => update('lat', e.target.value)}
                  placeholder="37.5665" className={inputCls} />
              </Field>
              <Field label="Longitude">
                <input type="number" step="0.0000001" value={form.lng}
                  onChange={e => update('lng', e.target.value)}
                  placeholder="126.9240" className={inputCls} />
              </Field>
            </div>

            <Field label="Source URL (33m2 listing)">
              <input type="url" value={form.source_url} onChange={e => update('source_url', e.target.value)}
                placeholder="https://33m2.co.kr/house/detail/..." className={inputCls} />
            </Field>
          </div>
        )}
      </section>

      {/* ─── Publishing ─── */}
      <section className="bg-white border border-[#E8E0D5] rounded-xl p-6">
        <h2 className="text-xl text-[#2C2420] font-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Publishing
        </h2>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" checked={form.is_published}
              onChange={e => update('is_published', e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#C4714A]" />
            <span className="text-sm text-[#2C2420]">
              <strong className="font-semibold">Published</strong>
              <span className="text-[#8B7355]"> — visible to guests on /stays page</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={e => update('is_featured', e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#C4714A]" />
            <span className="text-sm text-[#2C2420]">
              <strong className="font-semibold">Featured</strong>
              <span className="text-[#8B7355]"> — highlighted at the top of search results</span>
            </span>
          </label>
        </div>
      </section>

      {/* ─── Error + Save bar ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          ⚠ {error}
        </div>
      )}

      <div className="flex justify-end gap-3 sticky bottom-4 bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-md">
        <button type="button" onClick={() => router.push('/admin/stays')}
          className="px-5 py-2.5 border border-[#E8E0D5] text-[#5A4030] rounded-lg text-sm font-medium hover:bg-[#F5F0EB] transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : mode === 'create' ? 'Create stay' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
