import "server-only";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

const missingMetricsTableErrors = ["42P01", "PGRST106", "PGRST205"];

export async function recordWatchViewEvent(watchId: string) {
  const { error } = await supabaseAdmin.from("watch_view_events").insert({
    watch_id: watchId,
    source: "watch_detail",
  });

  if (error && !missingMetricsTableErrors.includes(error.code ?? "")) {
    throw new Error(error.message);
  }
}
