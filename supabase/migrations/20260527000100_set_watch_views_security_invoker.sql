do $$
begin
  if to_regclass('public.watch_comparison_view') is not null then
    execute 'alter view public.watch_comparison_view set (security_invoker = true)';
  end if;

  if to_regclass('public.watch_compare_view') is not null then
    execute 'alter view public.watch_compare_view set (security_invoker = true)';
  end if;
end $$;
