import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const admin = createAdminClient();
  let query = admin.from('stays').select('id,name,neighborhood_id,thumbnail_url,price_per_week_usd,is_published').order('name');
  if (q) query = query.or(`name.ilike.%${q}%,neighborhood_id.ilike.%${q}%`);
  const { data, error } = await query.limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('stays').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
