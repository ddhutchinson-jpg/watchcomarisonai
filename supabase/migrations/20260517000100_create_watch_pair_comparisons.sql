create table if not exists public.watch_pair_comparisons (
  id uuid primary key default gen_random_uuid(),
  watch_a_id uuid not null references public.watches(id) on delete cascade,
  watch_b_id uuid not null references public.watches(id) on delete cascade,
  summary text not null,
  fit_comparison text,
  movement_comparison text,
  value_comparison text,
  daily_wear_comparison text,
  enthusiast_take text,
  recommended_for jsonb,
  confidence_score numeric,
  model_used text,
  spec_snapshot_hash text not null,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watch_pair_comparisons_distinct_watches check (watch_a_id <> watch_b_id),
  constraint watch_pair_comparisons_unique_pair unique (watch_a_id, watch_b_id)
);

create index if not exists watch_pair_comparisons_watch_a_idx
  on public.watch_pair_comparisons(watch_a_id);

create index if not exists watch_pair_comparisons_watch_b_idx
  on public.watch_pair_comparisons(watch_b_id);

alter table public.watch_pair_comparisons enable row level security;
