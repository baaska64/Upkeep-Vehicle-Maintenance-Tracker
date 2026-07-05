-- Upkeep Phase 2 Schema

-- 1. Vehicles Table
create table if not exists public.vt_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  make text, 
  model text, 
  year int,
  vehicle_type text check (vehicle_type in ('car','motorcycle','scooter','truck','other')),
  vin text,
  current_mileage numeric default 0,
  mileage_unit text default 'km',
  photo_url text,
  fuel_type text,
  created_at timestamptz default now()
);

alter table public.vt_vehicles enable row level security;

create policy "owner reads own vehicles" on public.vt_vehicles
  for select using (auth.uid() = user_id);
create policy "owner writes own vehicles" on public.vt_vehicles
  for insert with check (auth.uid() = user_id);
create policy "owner updates own vehicles" on public.vt_vehicles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own vehicles" on public.vt_vehicles
  for delete using (auth.uid() = user_id);

-- 2. Service Categories
create table if not exists public.vt_service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  default_interval_km numeric,
  default_interval_months int,
  user_id uuid references auth.users(id) on delete cascade, -- null means global default
  created_at timestamptz default now()
);

alter table public.vt_service_categories enable row level security;

-- Everyone can read global categories OR their own custom categories
create policy "users can read global and own categories" on public.vt_service_categories
  for select using (user_id is null or auth.uid() = user_id);
create policy "users can create own categories" on public.vt_service_categories
  for insert with check (auth.uid() = user_id);
create policy "users can update own categories" on public.vt_service_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users can delete own categories" on public.vt_service_categories
  for delete using (auth.uid() = user_id);

-- 3. Service Logs
create table if not exists public.vt_service_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vt_vehicles(id) on delete cascade,
  category_id uuid not null references public.vt_service_categories(id),
  service_date date not null default current_date,
  mileage_at_service numeric not null,
  cost numeric default 0,
  currency text default 'PHP',
  performed_by text,
  notes text,
  receipt_url text,
  created_at timestamptz default now()
);

alter table public.vt_service_logs enable row level security;

-- Can only access logs if they own the vehicle
create policy "owner accesses own service logs" on public.vt_service_logs
  for all using (
    exists (
      select 1 from public.vt_vehicles
      where id = vt_service_logs.vehicle_id and user_id = auth.uid()
    )
  );

-- 4. Service Log Parts
create table if not exists public.vt_service_log_parts (
  id uuid primary key default gen_random_uuid(),
  service_log_id uuid not null references public.vt_service_logs(id) on delete cascade,
  part_name text not null,
  part_number text,
  brand text,
  quantity numeric default 1,
  unit_cost numeric default 0,
  created_at timestamptz default now()
);

alter table public.vt_service_log_parts enable row level security;

create policy "owner accesses own service log parts" on public.vt_service_log_parts
  for all using (
    exists (
      select 1 from public.vt_service_logs
      join public.vt_vehicles on vt_service_logs.vehicle_id = vt_vehicles.id
      where vt_service_logs.id = vt_service_log_parts.service_log_id 
        and vt_vehicles.user_id = auth.uid()
    )
  );

-- 5. Seed Default Categories
insert into public.vt_service_categories (name, icon, default_interval_km, default_interval_months)
values
  ('Oil Change', 'Droplet', 5000, 6),
  ('Spark Plugs', 'Zap', 20000, 24),
  ('Tire Rotation', 'RotateCcw', 10000, 12),
  ('Chain/Belt', 'Link', 1000, 1),
  ('Brake Pads', 'Disc', 15000, 18),
  ('Coolant Flush', 'Thermometer', 40000, 24),
  ('Air Filter', 'Wind', 15000, 12),
  ('Battery', 'Battery', null, 36)
on conflict do nothing;

-- 6. Storage Bucket for Receipts
insert into storage.buckets (id, name, public) 
values ('upkeep_receipts', 'upkeep_receipts', true)
on conflict (id) do nothing;

-- Ensure RLS on storage.objects
create policy "Anyone can view receipt images" on storage.objects
  for select using (bucket_id = 'upkeep_receipts');

create policy "Authenticated users can upload receipts" on storage.objects
  for insert with check (
    bucket_id = 'upkeep_receipts' and auth.role() = 'authenticated'
  );

create policy "Users can delete their own receipts" on storage.objects
  for delete using (
    bucket_id = 'upkeep_receipts' and auth.uid() = owner
  );
