import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.guest_name || !body.guest_email || !body.check_in_date || !body.check_out_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('booking_requests')
    .insert({ ...body, status: 'inquiry' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, display_id: data.display_id });
}
