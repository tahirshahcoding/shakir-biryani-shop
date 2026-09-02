import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/modules/inventory/inventory.service";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";

export const GET = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "INVENTORY_VIEW");

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const result = await getTransactions(id, {
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    type: searchParams.get("type") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });

  return NextResponse.json({ success: true, data: result });
});