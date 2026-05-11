create table if not exists public.watch_spec_candidates (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  field_name text not null,
  candidate_value text not null,
  candidate_unit text,
  source_url text,
  source_name text,
  source_type text not null default 'unknown',
  confidence_score numeric(4, 3),
  extraction_notes text,
  evidence_excerpt text,
  review_status text not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watch_spec_candidates_source_type_check check (
    source_type in (
      'manufacturer',
      'retailer',
      'review',
      'forum',
      'video',
      'ai_inferred',
      'unknown'
    )
  ),
  constraint watch_spec_candidates_review_status_check check (
    review_status in ('pending', 'approved', 'rejected')
  ),
  constraint watch_spec_candidates_confidence_score_check check (
    confidence_score is null
    or (confidence_score >= 0 and confidence_score <= 1)
  )
);

create index if not exists watch_spec_candidates_watch_id_idx
  on public.watch_spec_candidates(watch_id);

create index if not exists watch_spec_candidates_review_status_idx
  on public.watch_spec_candidates(review_status);

create index if not exists watch_spec_candidates_field_status_idx
  on public.watch_spec_candidates(field_name, review_status);

alter table public.watch_spec_candidates enable row level security;

-- Keep candidate writes private by default. Service-role jobs and direct SQL can
-- populate/review this table until an authenticated admin UI is added.

