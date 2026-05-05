import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { HostForm } from '@/components/admin/HostForm';
import Link from 'next/link';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export default async function EditHostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: host } = await admin.from('hosts').select('*').eq('id', id).single();
  if (!host) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/hosts" className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-4 inline-block">
        ← Back to hosts
      </Link>
      <h1 className="text-3xl text-[#2C2420] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
        {host.name}
      </h1>
      <HostForm mode="edit" initialData={host} />
    </div>
  );
}
