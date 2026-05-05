import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { DeleteHostButton } from '@/components/admin/DeleteHostButton';

export const dynamic = 'force-dynamic';

const ENGLISH_LABEL: Record<string, string> = {
  none: '🔴 None', basic: '🟠 Basic', intermediate: '🟡 Intermediate', fluent: '🟢 Fluent',
};

export default async function HostsPage() {
  const admin = createAdminClient();
  const { data: hosts } = await admin
    .from('hosts')
    .select('*, stays(count)')
    .order('total_bookings', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>Hosts</h1>
          <p className="text-sm text-[#8B7355] mt-1">{hosts?.length ?? 0} hosts</p>
        </div>
        <Link href="/admin/hosts/new">
          <button className="px-5 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] transition-colors">
            + Add host
          </button>
        </Link>
      </div>

      <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] border-b border-[#E8E0D5]">
            <tr>
              {['Name', 'Contact', 'English', 'Foreigners', 'Stays', 'Bookings', 'Reliability', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#5A4030] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E8DC]">
            {hosts?.map(host => (
              <tr key={host.id} className="hover:bg-[#FAF7F2]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#2C2420]">{host.name}</p>
                  {host.name_ko && <p className="text-xs text-[#8B7355]">{host.name_ko}</p>}
                  {!host.is_active && (
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[#5A4030] space-y-0.5">
                  {host.kakao_id && <p>📱 {host.kakao_id}</p>}
                  {host.phone && <p>☎️ {host.phone}</p>}
                </td>
                <td className="px-4 py-3 text-xs">{ENGLISH_LABEL[host.english_level] ?? '—'}</td>
                <td className="px-4 py-3">
                  {host.accepts_foreigners
                    ? <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium">OK</span>
                    : <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded font-medium">No</span>
                  }
                </td>
                <td className="px-4 py-3 text-[#5A4030]">{(host.stays as any)?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-[#5A4030] font-medium">{host.total_bookings}</td>
                <td className="px-4 py-3">
                  {host.reliability_score ? '⭐'.repeat(host.reliability_score) : '—'}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/hosts/${host.id}`}
                    className="text-[#C4714A] hover:underline text-sm mr-3">
                    Edit
                  </Link>
                  <DeleteHostButton hostId={host.id} hostName={host.name} />
                </td>
              </tr>
            ))}
            {(!hosts || hosts.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#8B7355]">
                  No hosts yet. <Link href="/admin/hosts/new" className="text-[#C4714A] hover:underline">Add your first host →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
