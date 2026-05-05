import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookingStatusManager } from '@/components/admin/BookingStatusManager';
import { BookingNoteAdder } from '@/components/admin/BookingNoteAdder';
import { BookingActivityTimeline } from '@/components/admin/BookingActivityTimeline';
import { BookingStayLinker } from '@/components/admin/BookingStayLinker';
import { NEIGHBORHOODS } from '@/data/neighborhoods';

export const dynamic = 'force-dynamic';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

const PERSONA_LABEL: Record<string, string> = {
  kpop: '🎤 K-pop fan', language: '🗣️ Language learner',
  wellness: '💆 Wellness', workation: '💻 Workation', other: '✈️ Other',
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: booking }, { data: activities }] = await Promise.all([
    admin.from('booking_requests').select('*, stay:stays(*, host:hosts(*))').eq('id', id).single(),
    admin.from('booking_activity_log').select('*').eq('booking_request_id', id).order('created_at', { ascending: true }),
  ]);

  if (!booking) notFound();

  const nbhd = booking.stay ? NEIGHBORHOODS.find(n => n.id === booking.stay.neighborhood_id) : null;
  const stayDays = daysBetween(booking.check_in_date, booking.check_out_date);

  return (
    <div className="max-w-5xl">
      <Link href="/admin" className="text-sm text-[#8B7355] hover:text-[#2C2420] mb-3 inline-block">
        ← Back to bookings
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <p className="text-xs text-[#A89880] font-mono mb-1">{booking.display_id}</p>
          <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
            {booking.guest_name}
          </h1>
          <p className="text-sm text-[#8B7355] mt-1">
            {fmtDate(booking.check_in_date)} → {fmtDate(booking.check_out_date)} · {stayDays} days · {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
          </p>
        </div>
        <BookingStatusManager booking={booking} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Guest contact */}
          <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
            <h2 className="font-medium text-[#2C2420] mb-3">Guest contact</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Email" value={booking.guest_email} />
              {booking.guest_phone && <InfoRow label="Phone" value={booking.guest_phone} />}
              {booking.guest_kakao_id && <InfoRow label="KakaoTalk" value={booking.guest_kakao_id} />}
              {booking.guest_country && <InfoRow label="Country" value={booking.guest_country} />}
              {booking.persona && <InfoRow label="Persona" value={PERSONA_LABEL[booking.persona] ?? booking.persona} />}
            </div>
          </section>

          {/* Stay & Host */}
          <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-[#2C2420]">Stay & Host</h2>
              <BookingStayLinker bookingId={booking.id} currentStayId={booking.stay_id} />
            </div>
            {booking.stay ? (
              <>
                <Link href={`/admin/stays/${booking.stay.id}`}>
                  <div className="flex gap-3 p-3 rounded-lg border border-[#E8E0D5] hover:border-[#C4714A] transition-colors">
                    {booking.stay.thumbnail_url && (
                      <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${booking.stay.thumbnail_url})` }} />
                    )}
                    <div>
                      <p className="font-medium text-[#2C2420]">{booking.stay.name}</p>
                      <p className="text-xs text-[#8B7355]">
                        {nbhd?.name ?? booking.stay.neighborhood_id} · ${booking.stay.price_per_week_usd}/wk
                      </p>
                      <p className="text-xs text-[#5A4030] mt-1">
                        Up to {booking.stay.max_guests} guests · {booking.stay.size_sqm}m²
                      </p>
                    </div>
                  </div>
                </Link>
                {booking.stay.host && (
                  <div className="mt-3 pt-3 border-t border-[#F0E8DC]">
                    <p className="text-xs text-[#8B7355] uppercase tracking-wide mb-2">Host</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[#2C2420]">{booking.stay.host.name}</p>
                        <p className="text-xs text-[#8B7355]">
                          {booking.stay.host.kakao_id ? `KakaoTalk: ${booking.stay.host.kakao_id} · ` : ''}
                          {booking.stay.host.speaks_english ? '🇬🇧 English OK' : '🇰🇷 Korean only'}
                        </p>
                      </div>
                      {booking.stay.host.kakao_id && (
                        <a href={`https://open.kakao.com/o/${booking.stay.host.kakao_id}`} target="_blank"
                          className="text-xs text-[#C4714A] hover:underline">
                          Open KakaoTalk →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[#8B7355]">
                <p className="text-sm mb-1">No stay linked yet</p>
                <p className="text-xs">Click "+ Link stay" to find a match</p>
              </div>
            )}
          </section>

          {/* Pricing */}
          <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
            <h2 className="font-medium text-[#2C2420] mb-3">Pricing</h2>
            <div className="space-y-2 text-sm">
              <PriceRow label="Rent (KRW)" value={booking.rent_amount_krw ? `₩${booking.rent_amount_krw.toLocaleString()}` : null} />
              <PriceRow label="Service fee (USD)" value={booking.service_fee_usd ? `$${booking.service_fee_usd}` : null} />
              {booking.tribe_pass_added && (
                <PriceRow label="Tribe Pass" value={`+$${booking.tribe_pass_amount_usd}`} />
              )}
              <div className="flex justify-between pt-2 border-t border-[#F0E8DC] font-medium">
                <span className="text-[#2C2420]">Total charged</span>
                <span className="text-[#2C2420]">{booking.total_charged_usd ? `$${booking.total_charged_usd}` : '—'}</span>
              </div>
            </div>
          </section>

          {/* Internal notes */}
          <section className="bg-white border border-[#E8E0D5] rounded-xl p-5">
            <h2 className="font-medium text-[#2C2420] mb-3">Internal notes</h2>
            <BookingNoteAdder bookingId={booking.id} initialNotes={booking.internal_notes ?? ''} />
          </section>
        </div>

        {/* Timeline */}
        <div>
          <section className="bg-white border border-[#E8E0D5] rounded-xl p-5 sticky top-20">
            <h2 className="font-medium text-[#2C2420] mb-3">Activity timeline</h2>
            <BookingActivityTimeline activities={activities ?? []} booking={booking} />
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#8B7355]">{label}</p>
      <p className="text-[#2C2420]">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#8B7355]">{label}</span>
      <span className="text-[#2C2420]">{value ?? '—'}</span>
    </div>
  );
}
