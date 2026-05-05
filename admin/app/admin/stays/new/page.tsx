import Link from 'next/link';
import { StayForm } from '@/components/admin/StayForm';

export const runtime = 'edge';

export default function NewStayPage() {
  return (
    <div>
      <Link href="/admin/stays"
        className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-3 inline-flex items-center gap-1 transition-colors">
        ← Back to stays
      </Link>
      <h1 className="text-3xl text-[#2C2420] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
        Add new stay
      </h1>
      <StayForm mode="create" />
    </div>
  );
}
