-- Supabase schema for Farfish

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table providers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  phone text unique not null,
  email text unique not null,
  category text not null,
  status text not null default 'pending',
  commission_rate numeric not null default 0.15,
  created_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  description_ar text not null,
  description_en text not null,
  category text not null,
  price_per_person numeric not null,
  max_capacity int not null,
  photos text[] default array[]::text[],
  location jsonb,
  availability jsonb,
  status text not null default 'pending',
  rating numeric default 0,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  date date not null,
  time_slot text not null,
  guests int not null,
  total_price numeric not null,
  commission numeric not null,
  net_payout numeric not null,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  reference_number text unique not null,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
