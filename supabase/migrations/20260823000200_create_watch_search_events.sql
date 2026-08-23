create table if not exists public.watch_search_events (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  search_query text not null,
  result_rank integer,
  source text not null default 'concierge_search',
  created_at timestamptz not null default now()
);

create index if not exists watch_search_events_watch_id_idx
  on public.watch_search_events(watch_id);

create index if not exists watch_search_events_created_at_idx
  on public.watch_search_events(created_at desc);

create index if not exists watch_search_events_watch_created_at_idx
  on public.watch_search_events(watch_id, created_at desc);

alter table public.watch_search_events enable row level security;
