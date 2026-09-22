-- Hosted debate loop: profiles, player_state, debates
-- Applied to project mvbtfmnzfxgdslwunwik (debates-ch). Left uncommitted.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  country text not null default '',
  coach_slug text,
  avatar jsonb,
  celebration text not null default 'confetti',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  overall_elo double precision not null default 35,
  ratings jsonb not null default '{}'::jsonb,
  rating_history jsonb not null default '[]'::jsonb,
  seen_motion_ids jsonb not null default '[]'::jsonb,
  puzzles jsonb not null default '{}'::jsonb,
  favourite_bots jsonb not null default '[]'::jsonb,
  recent_bots jsonb not null default '[]'::jsonb,
  motion_votes jsonb not null default '{}'::jsonb,
  motion_prefs jsonb not null default '{}'::jsonb,
  puzzle_day text,
  puzzle_attempts_today integer not null default 0,
  guest_lessons_completed integer not null default 0,
  lesson_progress jsonb not null default '{}'::jsonb,
  theme text not null default 'dark',
  updated_at timestamptz not null default now()
);

create table public.debates (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index debates_user_updated_idx on public.debates (user_id, updated_at desc);
create index debates_user_status_idx on public.debates (user_id, status);

alter table public.profiles enable row level security;
alter table public.player_state enable row level security;
alter table public.debates enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "player_state_select_own" on public.player_state
  for select to authenticated using (auth.uid() = user_id);
create policy "player_state_update_own" on public.player_state
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "player_state_insert_own" on public.player_state
  for insert to authenticated with check (auth.uid() = user_id);

create policy "debates_select_own" on public.debates
  for select to authenticated using (auth.uid() = user_id);
create policy "debates_insert_own" on public.debates
  for insert to authenticated with check (auth.uid() = user_id);
create policy "debates_update_own" on public.debates
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debates_delete_own" on public.debates
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do nothing;

  insert into public.player_state (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger player_state_updated_at
  before update on public.player_state
  for each row execute function public.set_updated_at();

create trigger debates_updated_at
  before update on public.debates
  for each row execute function public.set_updated_at();
