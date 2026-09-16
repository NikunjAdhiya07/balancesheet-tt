import { getSupabase } from "./supabase";

export async function recordAudit(
  entityType: "income" | "expense",
  entityId: number,
  action: "create" | "update" | "delete",
  snapshot: unknown
) {
  const supabase = getSupabase();
  const { error } = await supabase.from("audit_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    snapshot: JSON.stringify(snapshot),
    changed_at: new Date().toISOString(),
  });
  if (error) throw error;
}
