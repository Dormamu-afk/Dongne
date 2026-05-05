'use client';

import React, { useRef, useState } from 'react';

interface Props {
  id: string;
  name: string;
  ko: string;
  color: string;
  initialUrl?: string;
}

export function NeighborhoodPhotoUploader({ id, name, ko, color, initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`/api/admin/neighborhoods/${id}`, { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        setUrl(`${data.url}?t=${Date.now()}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Network error');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleDelete() {
    if (!confirm(`Remove photo for ${name}?`)) return;
    await fetch(`/api/admin/neighborhoods/${id}`, { method: 'DELETE' });
    setUrl(undefined);
  }

  return (
    <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden hover:border-[#C4714A] hover:shadow-sm transition-all">
      {/* Photo area */}
      <div
        className="relative h-40 cursor-pointer group"
        style={{ background: url ? undefined : `${color}18` }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}25` }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 5.25h18M3 5.25a2.25 2.25 0 00-2.25 2.25v11.25A2.25 2.25 0 003 21h18a2.25 2.25 0 002.25-2.25V7.5A2.25 2.25 0 0021 5.25H3z" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color }}>No photo</span>
          </div>
        )}

        {/* Upload overlay on hover */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-sm font-semibold bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              {url ? 'Replace photo' : 'Upload photo'}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#2C2420] leading-tight">{name}</div>
            <div className="text-xs text-[#8B7355] font-medium mt-0.5" style={{ fontFamily: 'Noto Sans KR, sans-serif' }}>{ko}</div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => !uploading && fileRef.current?.click()}
              disabled={uploading}
              className="px-2.5 py-1 text-xs font-semibold text-[#C4714A] border border-[#C4714A] rounded-md hover:bg-[#FBF3EE] transition-colors disabled:opacity-40"
            >
              {url ? 'Change' : 'Upload'}
            </button>
            {url && (
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 text-xs font-medium text-[#8B7355] border border-[#E8E0D5] rounded-md hover:bg-[#FAF7F2] hover:text-red-500 hover:border-red-200 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
