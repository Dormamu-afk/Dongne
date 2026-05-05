import { createAdminClient } from '@/lib/supabase/admin';
import { NeighborhoodPhotoUploader } from '@/components/admin/NeighborhoodPhotoUploader';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

const NEIGHBORHOODS = [
  { id: 'yeonnam',       name: 'Yeonnam-dong',     ko: '연남동',        color: '#C4714A' },
  { id: 'hongdae',       name: 'Hongdae',           ko: '홍대',          color: '#E07B50' },
  { id: 'mapo',          name: 'Mangwon · Mapo',    ko: '망원동',        color: '#4A7C59' },
  { id: 'myeongdong',    name: 'Myeongdong',        ko: '명동',          color: '#D44280' },
  { id: 'euljiro',       name: 'Euljiro · Jongno',  ko: '을지로·종로',   color: '#8B7355' },
  { id: 'dongdaemun',    name: 'Dongdaemun',        ko: '동대문',        color: '#C4490A' },
  { id: 'itaewon',       name: 'Itaewon · HBC',     ko: '이태원·해방촌', color: '#1A3A7A' },
  { id: 'yongsan',       name: 'Yongsan',           ko: '용산',          color: '#7A4A8A' },
  { id: 'hannam',        name: 'Hannam-dong',       ko: '한남동',        color: '#993556' },
  { id: 'seongsu',       name: 'Seongsu-dong',      ko: '성수동',        color: '#6B4226' },
  { id: 'cheongnyangni', name: 'Cheongnyangni',     ko: '청량리',        color: '#2C7A5A' },
  { id: 'apgujeong',     name: 'Apgujeong',         ko: '압구정',        color: '#7A1A5C' },
  { id: 'gangnam',       name: 'Gangnam',           ko: '강남',          color: '#185FA5' },
  { id: 'jamsil',        name: 'Jamsil · Songpa',   ko: '잠실·송파',     color: '#0F6E56' },
];

async function getManifest(): Promise<Record<string, string>> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from('neighborhood-photos').download('_manifest.json');
    if (error || !data) return {};
    return JSON.parse(await data.text());
  } catch {
    return {};
  }
}

export default async function NeighborhoodsPage() {
  const manifest = await getManifest();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Neighborhood Photos
        </h1>
        <p className="text-sm text-[#8B7355] mt-1">
          Hero photos displayed on the map panel when a neighborhood is selected.
          Recommended size: 1200 × 600 px, JPG or WebP.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {NEIGHBORHOODS.map(n => (
          <NeighborhoodPhotoUploader
            key={n.id}
            id={n.id}
            name={n.name}
            ko={n.ko}
            color={n.color}
            initialUrl={manifest[n.id]}
          />
        ))}
      </div>

      <p className="text-xs text-[#A89880] mt-6">
        Photos are stored in Supabase Storage (bucket: <code className="bg-[#F0EAE2] px-1 rounded">neighborhood-photos</code>) and served via public CDN.
        Changes appear on the live site within 60 seconds.
      </p>
    </div>
  );
}
