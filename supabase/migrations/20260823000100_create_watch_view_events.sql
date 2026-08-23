create table if not exists public.watch_view_events (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  source text not null default 'watch_detail',
  created_at timestamptz not null default now()
);

create index if not exists watch_view_events_watch_id_idx
  on public.watch_view_events(watch_id);

create index if not exists watch_view_events_created_at_idx
  on public.watch_view_events(created_at desc);

create index if not exists watch_view_events_watch_created_at_idx
  on public.watch_view_events(watch_id, created_at desc);

alter table public.watch_view_events enable row level security;
