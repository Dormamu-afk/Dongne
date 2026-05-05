import { HostForm } from '@/components/admin/HostForm';
import Link from 'next/link';

export const runtime = 'edge';

export default function NewHostPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/hosts" className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-4 inline-block">
        ← Back to hosts
      </Link>
      <h1 className="text-3xl text-[#2C2420] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
        Add new host
      </h1>
      <HostForm mode="create" />
    </div>
  );
}
