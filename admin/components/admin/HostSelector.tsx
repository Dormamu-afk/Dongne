'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function HostSelector({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const [hosts, setHosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('hosts')
        .select('id,name,name_ko')
        .eq('is_active', true)
        .order('name');
      setHosts(data ?? []);
    })();
  }, []);

  return (
    <div className="flex gap-2">
      <select value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="flex-1 px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#2C2420] focus:border-[#C4714A] focus:outline-none">
        <option value="">No host</option>
        {hosts.map(h => (
          <option key={h.id} value={h.id}>
            {h.name}{h.name_ko ? ` (${h.name_ko})` : ''}
          </option>
        ))}
      </select>
      <Link href="/admin/hosts/new" target="_blank">
        <button type="button"
          className="px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm text-[#5A4030] hover:bg-[#FAF7F2] transition-colors whitespace-nowrap">
          + New
        </button>
      </Link>
    </div>
  );
}
