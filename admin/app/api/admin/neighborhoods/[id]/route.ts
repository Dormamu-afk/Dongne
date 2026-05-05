import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';

const BUCKET = 'neighborhood-photos';
const MANIFEST = '_manifest.json';

async function getManifest(admin: ReturnType<typeof createAdminClient>): Promise<Record<string, string>> {
  try {
    const { data, error } = await admin.storage.from(BUCKET).download(MANIFEST);
    if (error || !data) return {};
    return JSON.parse(await data.text());
  } catch {
    return {};
  }
}

async function saveManifest(admin: ReturnType<typeof createAdminClient>, manifest: Record<string, string>) {
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  await admin.storage.from(BUCKET).upload(MANIFEST, blob, {
    upsert: true,
    cacheControl: '60',
    contentType: 'application/json',
  });
}

async function ensureBucket(admin: ReturnType<typeof createAdminClient>) {
  const { error } = await admin.storage.createBucket(BUCKET, { public: true });
  // Ignore "already exists" error
  if (error && !error.message.includes('already exists')) throw error;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const admin = createAdminClient();
  await ensureBucket(admin);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${id}.${ext}`;

  // Remove old files for this neighborhood (different extensions)
  for (const oldExt of ['jpg', 'jpeg', 'png', 'webp']) {
    if (oldExt !== ext) await admin.storage.from(BUCKET).remove([`${id}.${oldExt}`]);
  }

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

  const manifest = await getManifest(admin);
  manifest[id] = publicUrl;
  await saveManifest(admin, manifest);

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    await admin.storage.from(BUCKET).remove([`${id}.${ext}`]);
  }

  const manifest = await getManifest(admin);
  delete manifest[id];
  await saveManifest(admin, manifest);

  return NextResponse.json({ success: true });
}
