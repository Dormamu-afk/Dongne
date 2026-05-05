import Link from 'next/link';
import { StayForm } from '@/components/admin/StayForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditStayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: stay } = await supabase.from('stays').select('*').eq('id', id).single();

  if (!stay) notFound();

  return (
    <div>
      <Link href="/admin/stays"
        className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-3 inline-flex items-center gap-1 transition-colors">
        ← Back to stays
      </Link>
      <h1 className="text-3xl text-[#2C2420] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
        Edit: {stay.name}
      </h1>
      <StayForm mode="edit" initialData={stay} />
    </div>
  );
}
