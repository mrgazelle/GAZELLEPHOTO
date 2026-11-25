-- ============================================================
-- GAZELLE PHOTO — Supabase PostgreSQL Schema
-- ============================================================
-- Run this in your Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fast text search

-- ──────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ──────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  created_at  timestamptz default now()
);

insert into categories (name, slug, icon) values
  ('Nightlife', 'night', 'moon'),
  ('Cars', 'cars', 'car'),
  ('People', 'people', 'user'),
  ('Urban', 'urban', 'building'),
  ('Events', 'events', 'calendar'),
  ('Football', 'football', 'trophy');

-- ──────────────────────────────────────────────
-- EVENTS
-- ──────────────────────────────────────────────
create table events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  poster_url    text,
  date          date not null,
  time_start    time,
  time_end      time,
  location      text,
  status        text not null default 'scheduled'
                  check (status in ('scheduled','ongoing','post-production','canceled','completed')),
  is_public     boolean not null default true,
  token         text unique default encode(gen_random_bytes(16), 'hex'),
  category_id   uuid references categories(id) on delete set null,
  price_logged  numeric(10,2),          -- actual revenue for this event (admin only)
  created_at    timestamptz default now()
);

create index idx_events_date on events(date desc);
create index idx_events_status on events(status);
create index idx_events_is_public on events(is_public);
create index idx_events_token on events(token);

-- ──────────────────────────────────────────────
-- PHOTOS
-- ──────────────────────────────────────────────
create table photos (
  id             uuid primary key default uuid_generate_v4(),
  event_id       uuid not null references events(id) on delete cascade,
  url            text not null,
  thumbnail_url  text not null,
  public_id      text not null,          -- Cloudinary public_id
  exif_data      jsonb default '{}',     -- {shutter_speed, iso, aperture, focal_length, camera, lens}
  taken_at       timestamptz,
  width          integer,
  height         integer,
  created_at     timestamptz default now()
);

create index idx_photos_event on photos(event_id);
create index idx_photos_taken_at on photos(taken_at);

-- ──────────────────────────────────────────────
-- FAVORITES
-- ──────────────────────────────────────────────
create table favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  photo_id    uuid not null references photos(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, photo_id)
);

create index idx_favorites_user on favorites(user_id);

-- ──────────────────────────────────────────────
-- BOOKING REQUESTS
-- ──────────────────────────────────────────────
create table booking_requests (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid references profiles(id) on delete set null,
  name                   text not null,
  email                  text not null,
  category               text not null,
  duration               text not null,
  location               text not null,
  photography_type       text not null,
  message                text,
  estimated_price_min    numeric(10,2),
  estimated_price_max    numeric(10,2),
  status                 text not null default 'pending'
                           check (status in ('pending','reviewed','accepted','rejected')),
  created_at             timestamptz default now()
);

create index idx_booking_status on booking_requests(status);
create index idx_booking_email on booking_requests(email);

-- ──────────────────────────────────────────────
-- EVENT SUBSCRIPTIONS (notify when photos ready)
-- ──────────────────────────────────────────────
create table event_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  user_id     uuid references profiles(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(email, event_id)
);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────

alter table profiles enable row level security;
alter table categories enable row level security;
alter table events enable row level security;
alter table photos enable row level security;
alter table favorites enable row level security;
alter table booking_requests enable row level security;
alter table event_subscriptions enable row level security;

-- Profiles
create policy "Users can read own profile"     on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"   on profiles for update using (auth.uid() = id);
create policy "Admin can read all profiles"    on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Categories: public read, admin write
create policy "Public can read categories"    on categories for select using (true);
create policy "Admin can manage categories"   on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Events: public can read public events OR events by token
create policy "Public events visible to all"  on events for select using (is_public = true);
create policy "Admin can manage events"        on events for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Photos: visible if event is public, admin sees all
create policy "Photos visible for public events" on photos for select using (
  exists (select 1 from events where id = event_id and is_public = true)
);
create policy "Admin can manage photos" on photos for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Favorites: users manage their own
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);

-- Booking requests: insert by anyone, read/update by admin
create policy "Anyone can create booking"      on booking_requests for insert with check (true);
create policy "Admin manages bookings"         on booking_requests for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions: users manage their own, admin reads all
create policy "Anyone can subscribe"            on event_subscriptions for insert with check (true);
create policy "Users see own subscriptions"     on event_subscriptions for select using (email = auth.email());
create policy "Admin manages subscriptions"     on event_subscriptions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ──────────────────────────────────────────────
-- HELPER VIEWS
-- ──────────────────────────────────────────────

-- Events with photo count and category name
create or replace view events_with_meta as
select
  e.*,
  c.name  as category_name,
  c.slug  as category_slug,
  count(p.id) as photo_count
from events e
left join categories c on c.id = e.category_id
left join photos p on p.event_id = e.id
group by e.id, c.name, c.slug;

-- Financial summary by month
create or replace view revenue_by_month as
select
  to_char(date, 'YYYY-MM') as month,
  sum(price_logged) as total,
  count(*) as event_count
from events
where price_logged is not null
group by to_char(date, 'YYYY-MM')
order by month desc;

-- Financial summary by category
create or replace view revenue_by_category as
select
  c.name as category,
  sum(e.price_logged) as total,
  count(*) as event_count
from events e
join categories c on c.id = e.category_id
where e.price_logged is not null
group by c.name
order by total desc;
