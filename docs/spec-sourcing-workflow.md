# Spec Sourcing Workflow

Use this workflow to fill missing watch specs without letting unreviewed AI output touch the canonical watch tables.

## 1. Find The Gaps

Run:

```sql
supabase/queries/missing-specs-priority.sql
```

Start with records missing core comparison fields:

- `case_size_mm`
- `case_material`
- `case_thickness_mm`
- `lug_to_lug_mm`
- `lug_width_mm`
- `weight_grams`
- `date_display`
- `has_chronograph`
- `has_gmt`
- `movement_type`
- `caliber`
- `power_reserve_hours`
- `water_resistance_m`

Then fill enthusiast fields:

- `bracelet_taper_from_mm`
- `bracelet_taper_to_mm`
- `clasp_type`
- `micro_adjustment_mm`
- `adjustment_system_normalized`
- `overall_wearability_summary`

## 2. Collect Candidate Values

Insert sourced values into `public.watch_spec_candidates`, one row per field. Do not update `public.watches` directly during sourcing.

Source priority:

1. Manufacturer product page, manual, or press kit
2. Major authorized dealer or retailer
3. Trusted review site with direct measurement
4. Owner/forum/video measurement
5. AI inference, only when clearly marked and reviewed

## 3. Review Candidates

Each candidate should include:

- `field_name`
- `candidate_value`
- `candidate_unit`
- `source_url`
- `source_type`
- `confidence_score`
- `evidence_excerpt` or `extraction_notes`

Set `review_status` to `approved` only after a human review.

## 4. Promote Approved Specs

Approved candidates can be promoted into the canonical tables with explicit SQL updates. Keep this as a separate step so bad source data is easy to reject.

## 5. Automate Later

Once the manual review loop feels right, add an admin page that shows each watch, missing fields, candidate values, source links, and approve/reject actions.
