import { base44 } from "@/api/base44Client";

export async function logAction(actor, action, target = "", details = "") {
  try {
    await base44.entities.AuditLog.create({
      actor_id: actor?.id || "",
      actor_name: actor?.display_name || actor?.full_name || "النظام",
      action,
      target,
      details,
    });
  } catch {
    // تجاهل
  }
}