-- La Bella Máquina — initial schema: auth profiles + Mi Garaje system.
-- Run this in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null unique,
  avatar_url text,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- `points` must never be settable directly by the client (only by the award_*
-- triggers further down, via progress entries / comments). pg_trigger_depth() = 0
-- means this UPDATE came straight from a client request rather than from inside
-- another trigger, so silently pin points back to its previous value in that case.
create function public.guard_profile_points()
returns trigger
language plpgsql
as $$
begin
  if pg_trigger_depth() = 0 and new.points is distinct from old.points then
    new.points := old.points;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_points
  before update on public.profiles
  for each row execute function public.guard_profile_points();

-- Auto-create a profile row when someone signs up. The racer display name is
-- passed as `data: { display_name }` in the client's supabase.auth.signUp() call.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- garage_projects — one custom-build project per member ("Mi Garaje")
-- ─────────────────────────────────────────────────────────────────────────
create table public.garage_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  nombre text not null,
  specs text,
  color text not null default '#C6FF3D',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.garage_projects enable row level security;

create policy "garage projects are viewable by authenticated users"
  on public.garage_projects for select
  to authenticated
  using (true);

create policy "users manage their own garage project"
  on public.garage_projects for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger garage_projects_set_updated_at
  before update on public.garage_projects
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- progress_entries — bitácora de avance (mandatory photo, points by tipo)
-- ─────────────────────────────────────────────────────────────────────────
create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  garage_project_id uuid not null references public.garage_projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null check (tipo in ('pintura', 'motor', 'rines', 'aero', 'accesorios', 'otro')),
  texto text not null,
  photo_url text not null,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.progress_entries enable row level security;

create policy "progress entries are viewable by authenticated users"
  on public.progress_entries for select
  to authenticated
  using (true);

create policy "users log progress only on their own project"
  on public.progress_entries for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.garage_projects gp
      where gp.id = garage_project_id and gp.user_id = auth.uid()
    )
  );

-- Points are computed server-side from `tipo`, never trusted from the client.
create function public.set_progress_points()
returns trigger
language plpgsql
as $$
begin
  new.points_awarded := case new.tipo
    when 'pintura' then 40
    when 'motor' then 60
    when 'rines' then 30
    when 'aero' then 30
    when 'accesorios' then 15
    else 20
  end;
  return new;
end;
$$;

create trigger progress_entries_set_points
  before insert on public.progress_entries
  for each row execute function public.set_progress_points();

create function public.award_progress_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set points = points + new.points_awarded
  where id = new.user_id;
  return new;
end;
$$;

create trigger progress_entries_award_points
  after insert on public.progress_entries
  for each row execute function public.award_progress_points();

-- ─────────────────────────────────────────────────────────────────────────
-- garage_comments — comments left on a member's garage project
-- ─────────────────────────────────────────────────────────────────────────
create table public.garage_comments (
  id uuid primary key default gen_random_uuid(),
  garage_owner_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

alter table public.garage_comments enable row level security;

create policy "garage comments are viewable by authenticated users"
  on public.garage_comments for select
  to authenticated
  using (true);

create policy "authenticated users can comment"
  on public.garage_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "authors can delete their own comment"
  on public.garage_comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- +5 points for commenting on someone else's project (not your own).
create function public.award_comment_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.author_id <> new.garage_owner_id then
    update public.profiles set points = points + 5 where id = new.author_id;
  end if;
  return new;
end;
$$;

create trigger garage_comments_award_points
  after insert on public.garage_comments
  for each row execute function public.award_comment_points();

-- ─────────────────────────────────────────────────────────────────────────
-- Storage buckets: avatars, garage-photos (both public-read)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('garage-photos', 'garage-photos', true)
on conflict (id) do nothing;

-- Uploads are scoped to a folder named after the uploader's user id, e.g.
-- `avatars/<user_id>/avatar.jpg` or `garage-photos/<user_id>/progress/<entry_id>.jpg`.
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users manage their own avatar folder"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public read garage photos"
  on storage.objects for select
  using (bucket_id = 'garage-photos');

create policy "users manage their own garage photo folder"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'garage-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'garage-photos' and (storage.foldername(name))[1] = auth.uid()::text);
