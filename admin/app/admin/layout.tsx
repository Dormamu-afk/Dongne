import Link from 'next/link';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

async function sessionToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('session'));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  if (!session || !process.env.ADMIN_PASSWORD) return false;
  const expected = await sessionToken(process.env.ADMIN_PASSWORD);
  return session === expected;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const admin = createAdminClient();
  const [staysRes, hostsRes, bookingsRes] = await Promise.all([
    admin.from('stays').select('*', { count: 'exact', head: true }),
    admin.from('hosts').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('booking_requests').select('*', { count: 'exact', head: true })
      .not('status', 'in', '(completed,cancelled,rejected)'),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white border-b border-[#E8E0D5] px-6 py-3 flex items-center justify-between sticky top-0 z-50 h-14">
        <Link href="/admin" className="text-xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Loc<span className="text-[#C4714A]">ali</span>{' '}
          <span className="text-xs font-medium tracking-widest text-[#8B7355] uppercase ml-1">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#8B7355] hover:text-[#2C2420] hidden sm:block">
            View site ↗
          </a>
          <LogoutButton />
        </div>
      </header>

      <div className="flex">
        <aside className="w-52 bg-white border-r border-[#E8E0D5] min-h-[calc(100vh-56px)] py-5 px-3 sticky top-14 flex-shrink-0">
          <nav className="space-y-0.5">
            <Link href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              <span className="flex items-center gap-2">
                <span>📋</span><span>Bookings</span>
              </span>
              {(bookingsRes.count ?? 0) > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[#C4714A] text-white rounded-full font-medium">
                  {bookingsRes.count}
                </span>
              )}
            </Link>
            <Link href="/admin/stays"
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              <span className="flex items-center gap-2">
                <span>🏠</span><span>Stays</span>
              </span>
              <span className="text-xs text-[#A89880]">{staysRes.count ?? 0}</span>
            </Link>
            <Link href="/admin/hosts"
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              <span className="flex items-center gap-2">
                <span>👤</span><span>Hosts</span>
              </span>
              <span className="text-xs text-[#A89880]">{hostsRes.count ?? 0}</span>
            </Link>
            <Link href="/admin/neighborhoods"
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              <span className="flex items-center gap-2">
                <span>🗺️</span><span>Neighborhoods</span>
              </span>
            </Link>
          </nav>

          <div className="mt-6 pt-4 border-t border-[#F0E8DC]">
            <p className="text-[10px] text-[#A89880] uppercase tracking-wide mb-1.5 px-3">Quick add</p>
            <Link href="/admin/bookings/new"
              className="block px-3 py-2 rounded-md text-sm text-[#C4714A] hover:bg-[#FAF0EC] font-medium transition-colors">
              + Booking request
            </Link>
            <Link href="/admin/stays/new"
              className="block px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              + Stay
            </Link>
            <Link href="/admin/hosts/new"
              className="block px-3 py-2 rounded-md text-sm text-[#5A4030] hover:bg-[#F5F0EB] transition-colors">
              + Host
            </Link>
          </div>
        </aside>

        <main className="flex-1 px-6 py-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
