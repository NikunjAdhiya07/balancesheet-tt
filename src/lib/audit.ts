import { getDb } from "./db";

export function recordAudit(
  entityType: "income" | "expense",
  entityId: number,
  action: "create" | "update" | "delete",
  snapshot: unknown
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_log (entity_type, entity_id, action, snapshot, changed_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(entityType, entityId, action, JSON.stringify(snapshot), new Date().toISOString());
}
