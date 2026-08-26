import * as auditRepo from "./audit.repository";

export async function logAudit(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  return auditRepo.create(params);
}
