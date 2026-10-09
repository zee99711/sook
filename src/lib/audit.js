// src/lib/audit.js
import { auditAPI } from '@/api/entities';

export async function logAction(actor, action, target = '', details = '') {
  try {
    await auditAPI.log({
      actor_id: actor?.id || null,
      actor_name: actor?.display_name || actor?.full_name || 'النظام',
      action,
      target,
      details,
    });
  } catch (err) {
    console.warn('Audit log failed:', err);
  }
}