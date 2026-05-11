with missing_specs as (
  select
    watch_id,
    brand_name,
    collection_name,
    model_name,
    reference_number,
    concat_ws(
      ' ',
      brand_name,
      collection_name,
      model_name,
      reference_number
    ) as source_search_query,
    array_remove(
      array[
        case when case_size_mm is null then 'case_size_mm' end,
        case when case_material is null then 'case_material' end,
        case when case_thickness_mm is null then 'case_thickness_mm' end,
        case when lug_to_lug_mm is null then 'lug_to_lug_mm' end,
        case when lug_width_mm is null then 'lug_width_mm' end,
        case when weight_grams is null then 'weight_grams' end,
        case when water_resistance_m is null then 'water_resistance_m' end,
        case when date_display is null then 'date_display' end,
        case when has_chronograph is null then 'has_chronograph' end,
        case when has_gmt is null then 'has_gmt' end,
        case when movement_type is null then 'movement_type' end,
        case when caliber is null then 'caliber' end,
        case when power_reserve_hours is null then 'power_reserve_hours' end,
        case
          when bracelet_taper_from_mm is null
            or bracelet_taper_to_mm is null
            then 'bracelet_taper_from_mm,bracelet_taper_to_mm'
        end,
        case when clasp_type is null then 'clasp_type' end,
        case
          when micro_adjustment_mm is null
            and adjustment_system_normalized is null
            then 'micro_adjustment_mm,adjustment_system_normalized'
        end,
        case
          when overall_wearability_summary is null
            and comfort_notes is null
            then 'overall_wearability_summary'
        end
      ],
      null
    ) as missing_fields
  from public.watch_comparison_view
)
select *
from missing_specs
where array_length(missing_fields, 1) > 0
order by
  array_length(missing_fields, 1) desc,
  brand_name asc,
  collection_name asc,
  model_name asc;
