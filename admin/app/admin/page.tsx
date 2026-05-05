import { createAdminClient } from '@/lib/supabase/admin';
import { BookingKanbanBoard } from '@/components/admin/BookingKanbanBoard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ACTIVE_STATUSES = ['inquiry','curating','proposed','host_pending','host_confirmed','payment_pending','paid','booked','checked_in'];

export default async function BookingsPage() {
  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from('booking_requests')
    .select('*, stay:stays(id,name,thumbnail_url,neighborhood_id)')
    .in('status', ACTIVE_STATUSES)
    .order('inquiry_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Booking Requests
          </h1>
          <p className="text-sm text-[#8B7355] mt-1">
            {bookings?.length ?? 0} active · drag cards to update status
          </p>
        </div>
        <Link href="/admin/bookings/new">
          <button className="px-4 py-2 bg-[#2C2420] text-white rounded-lg text-sm font-medium hover:bg-[#C4714A] transition-colors">
            + New request
          </button>
        </Link>
      </div>
      <BookingKanbanBoard bookings={bookings ?? []} />
    </div>
  );
}
