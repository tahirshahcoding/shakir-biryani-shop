import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import * as auditRepo from "@/modules/audit/audit.repository";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "ROLES_MANAGE");
  const { searchParams } = new URL(request.url);

  const result = await auditRepo.findMany({
    userId: searchParams.get("userId") || undefined,
    entityType: searchParams.get("entityType") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 50,
  });

  return NextResponse.json({ success: true, data: result });
});