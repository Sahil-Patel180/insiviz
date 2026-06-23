
  # Create ASCII Gradient Website

  This is a code bundle for Create ASCII Gradient Website. The original project is available at https://www.figma.com/design/Q8gHTH56L6uYGiASqAojlM/Create-ASCII-Gradient-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase setup

  This app runs on Vite, so use these environment variables instead of Next.js names:

  ```bash
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

  The auth API uses Supabase when those values are present and falls back to the local JSON store otherwise.

  Run this SQL once in Supabase:

  ```sql
  create table public.profiles (
    id uuid references auth.users(id) primary key,
    email text not null,
    role text not null check (role in ('dev', 'customer', 'admin')),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    organization text,
    full_name text,
    must_change_password boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table public.access_requests (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    organization text,
    full_name text,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz default now()
  );

  create table public.otp_codes (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    otp_hash text not null,
    expires_at timestamptz not null,
    attempts int default 0,
    created_at timestamptz default now()
  );

  alter table public.profiles enable row level security;
  alter table public.access_requests enable row level security;

  create or replace function public.is_admin()
  returns boolean language sql security definer as $$
    select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
  $$;

  create policy "own profile select" on public.profiles
    for select to authenticated using (auth.uid() = id);

  create policy "own profile update" on public.profiles
    for update to authenticated using (auth.uid() = id);

  create policy "admin full access" on public.profiles
    for all to authenticated using (public.is_admin());

  create policy "admin manage requests" on public.access_requests
    for all to authenticated using (public.is_admin());
  ```

  Create your first dev account in Supabase Auth, then insert the matching row into `profiles`.

  The app stores OTP and reset-token rows in the same `otp_codes` table by prefixing the stored `otp_hash` value internally, so no extra discriminator column is required.
  