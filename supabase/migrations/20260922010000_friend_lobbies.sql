-- Friend-over-network lobbies: shared invite code + live round state.
-- Applied to debates-ch (mvbtfmnzfxgdslwunwik).

create table public.friend_lobbies (
  code text primary key,
  host_id uuid not null references auth.users (id) on delete cascade,
  guest_id uuid references auth.users (id) on delete set null,
  host_name text not null default '',
  guest_name text not null default '',
  status text not null default 'waiting'
    check (status in ('waiting', 'ready', 'in_progress', 'complete', 'abandoned')),
  format_id text not null default 'bullet',
  rated boolean not null default false,
  host_side text not null default 'for'
    check (host_side in ('for', 'against')),
  host_ready boolean not null default false,
  guest_ready boolean not null default false,
  motion_id text,
  motion_text text,
  phase_index integer not null default 0,
  phase_remaining_sec integer not null default 0,
  transcript jsonb not null default '[]'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  judgement jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index friend_lobbies_host_idx on public.friend_lobbies (host_id, updated_at desc);
create index friend_lobbies_guest_idx on public.friend_lobbies (guest_id, updated_at desc);

alter table public.friend_lobbies enable row level security;

create policy "friend_lobbies_select"
  on public.friend_lobbies for select to authenticated
  using (
    auth.uid() = host_id
    or auth.uid() = guest_id
    or (status = 'waiting' and guest_id is null)
  );

create policy "friend_lobbies_insert_host"
  on public.friend_lobbies for insert to authenticated
  with check (auth.uid() = host_id);

create policy "friend_lobbies_update_participants"
  on public.friend_lobbies for update to authenticated
  using (
    auth.uid() = host_id
    or auth.uid() = guest_id
    or (status = 'waiting' and guest_id is null)
  )
  with check (
    auth.uid() = host_id
    or auth.uid() = guest_id
  );

create policy "friend_lobbies_delete_host"
  on public.friend_lobbies for delete to authenticated
  using (auth.uid() = host_id);

create trigger friend_lobbies_updated_at
  before update on public.friend_lobbies
  for each row execute function public.set_updated_at();

-- Realtime for live lobby + room sync
alter publication supabase_realtime add table public.friend_lobbies;
