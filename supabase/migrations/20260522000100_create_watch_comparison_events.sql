create table if not exists public.watch_comparison_events (
  id uuid primary key default gen_random_uuid(),
  watch_a_id uuid not null references public.watches(id) on delete cascade,
  watch_b_id uuid not null references public.watches(id) on delete cascade,
  pair_key text not null,
  source text not null default 'ai_compare',
  created_at timestamptz not null default now(),
  constraint watch_comparison_events_distinct_watches check (watch_a_id <> watch_b_id)
);

create index if not exists watch_comparison_events_pair_key_idx
  on public.watch_comparison_events(pair_key);

create index if not exists watch_comparison_events_created_at_idx
  on public.watch_comparison_events(created_at desc);

create index if not exists watch_comparison_events_pair_created_at_idx
  on public.watch_comparison_events(pair_key, created_at desc);

alter table public.watch_comparison_events enable row level security;
