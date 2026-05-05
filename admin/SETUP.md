# Locali Admin — 첫 실행 전 필수 설정

## 1. Supabase SQL 스키마 적용 (한 번만)

1. https://supabase.com/dashboard/project/zkewjuqlfdtsrzueiozz/sql/new 접속
2. 아래 SQL을 전체 복사 후 실행

```sql
create table if not exists stays (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  neighborhood_id text not null,
  price_per_week_usd integer not null,
  thumbnail_url text not null,
  name_ko text,
  description text,
  description_ko text,
  address text,
  address_ko text,
  size_sqm integer,
  max_guests integer default 1,
  bedrooms integer default 0,
  bathrooms integer default 1,
  price_per_month_usd integer,
  price_per_2week_usd integer,
  deposit_krw integer,
  amenities text[] default array[]::text[],
  image_urls text[] default array[]::text[],
  source_url text,
  source_platform text default '33m2',
  lat numeric(10, 7),
  lng numeric(10, 7),
  is_published boolean default true,
  is_featured boolean default false,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_stays_neighborhood on stays(neighborhood_id);
create index if not exists idx_stays_published on stays(is_published) where is_published = true;
create index if not exists idx_stays_featured on stays(is_featured) where is_featured = true;

create or replace function update_updated_at_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists update_stays_updated_at on stays;
create trigger update_stays_updated_at
  before update on stays for each row
  execute function update_updated_at_column();

alter table stays enable row level security;

drop policy if exists "Public can read published stays" on stays;
create policy "Public can read published stays"
  on stays for select using (is_published = true);

drop policy if exists "Service role can do anything" on stays;
create policy "Service role can do anything"
  on stays for all using (auth.role() = 'service_role');
```

## 2. Supabase Auth 이메일 리다이렉트 설정

1. https://supabase.com/dashboard/project/zkewjuqlfdtsrzueiozz/auth/url-configuration 접속
2. **Site URL**: `http://localhost:3001`
3. **Redirect URLs**에 추가: `http://localhost:3001/admin/auth/callback`
4. Save

## 3. 앱 실행

```bash
cd /workspaces/codespaces-blank/admin
npm run dev -- -p 3001
```

→ http://localhost:3001 접속 → 자동으로 /admin/stays로 이동
→ /admin/login에서 simun.yang@gmail.com으로 매직링크 발송
