import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { voidSale, getSaleById } from "@/modules/sales/sale.service";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  await requireSession();
  const { id } = await params;
  const sale = await getSaleById(id);
  if (!sale) throw new NotFoundError("Sale");
  return NextResponse.json({ success: true, data: sale });
});

export const POST = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "SALES_VOID");
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.action === "void") {
    const sale = await voidSale(id, session.userId);
    return NextResponse.json({ success: true, data: sale });
  }
  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
});
