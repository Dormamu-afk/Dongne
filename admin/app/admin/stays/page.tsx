import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { DeleteStayButton } from '@/components/admin/DeleteStayButton';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export default async function AdminStaysPage({
  searchParams,
}: {
  searchParams: Promise<{ neighborhood?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('stays')
    .select('*')
    .order('created_at', { ascending: false });

  if (params.neighborhood) query = query.eq('neighborhood_id', params.neighborhood);
  if (params.search) query = query.ilike('name', `%${params.search}%`);

  const { data: stays, error } = await query;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Stays
          </h1>
          <p className="text-sm text-[#8B7355] mt-1">
            {stays?.length ?? 0} stays sourced from 33m2
          </p>
        </div>
        <Link href="/admin/stays/new">
          <button className="px-5 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] transition-colors">
            + Add new stay
          </button>
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 mb-6">
        <form method="get" className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-[#8B7355] mb-1">Search by name</label>
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Yeonnam Studio..."
              className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm focus:border-[#C4714A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Neighborhood</label>
            <select
              name="neighborhood"
              defaultValue={params.neighborhood}
              className="px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm min-w-[170px] focus:border-[#C4714A] focus:outline-none"
            >
              <option value="">All neighborhoods</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 border border-[#2C2420] text-[#2C2420] rounded-lg text-sm hover:bg-[#2C2420] hover:text-white transition-colors"
          >
            Filter
          </button>
          {(params.search || params.neighborhood) && (
            <a href="/admin/stays" className="px-4 py-2 text-sm text-[#8B7355] hover:text-[#2C2420]">
              Clear
            </a>
          )}
        </form>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden">
        {error && (
          <div className="p-6 text-red-600 text-sm">
            Error loading stays: {error.message}
          </div>
        )}

        {!error && stays && stays.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E0D5]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Image</th>
                <th className="text-left px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Neighborhood</th>
                <th className="text-left px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Price/wk</th>
                <th className="text-left px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#2C2420] text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0EB]">
              {stays.map((stay) => {
                const nbhd = NEIGHBORHOODS.find((n) => n.id === stay.neighborhood_id);
                return (
                  <tr key={stay.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-4 py-3">
                      <div
                        className="w-14 h-14 rounded-lg bg-cover bg-center bg-[#F5F0EB]"
                        style={{ backgroundImage: stay.thumbnail_url ? `url(${stay.thumbnail_url})` : undefined }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2C2420]">{stay.name}</p>
                      {stay.name_ko && (
                        <p className="text-xs text-[#8B7355] mt-0.5">{stay.name_ko}</p>
                      )}
                      {stay.size_sqm && (
                        <p className="text-xs text-[#A89880] mt-0.5">{stay.size_sqm}m² · {stay.max_guests} guests</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#5A4030]">
                      <span>{nbhd?.name || stay.neighborhood_id}</span>
                      {nbhd?.nameKo && <span className="text-xs text-[#8B7355] block">{nbhd.nameKo}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#2C2420]">${stay.price_per_week_usd}</span>
                      <span className="text-xs text-[#8B7355]">/wk</span>
                      {stay.price_per_month_usd && (
                        <span className="text-xs text-[#A89880] block">${stay.price_per_month_usd}/mo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {stay.is_published ? (
                          <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium w-fit">
                            Published
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium w-fit">
                            Draft
                          </span>
                        )}
                        {stay.is_featured && (
                          <span className="inline-block px-2 py-0.5 bg-[#FAE8DC] text-[#7A3A1E] rounded text-xs font-medium w-fit">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/stays/${stay.id}`}
                          className="text-[#C4714A] hover:text-[#A05A38] hover:underline text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteStayButton stayId={stay.id} stayName={stay.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!error && (!stays || stays.length === 0) && (
          <div className="text-center py-16 text-[#8B7355]">
            <p className="text-4xl mb-4">🏠</p>
            <p className="font-medium text-[#2C2420] mb-1">No stays yet</p>
            <p className="text-sm mb-4">Start adding stays from 33m2</p>
            <Link
              href="/admin/stays/new"
              className="inline-block px-5 py-2.5 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] transition-colors"
            >
              + Add your first stay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
