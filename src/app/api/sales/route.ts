import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createSaleSchema } from "@/lib/validation/schemas";
import { getSales, createSale } from "@/modules/sales/sale.service";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireSession();
  const { searchParams } = new URL(request.url);
  const result = await getSales({
    status: searchParams.get("status") || undefined,
    paymentMethod: searchParams.get("paymentMethod") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    search: searchParams.get("search") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });
  return NextResponse.json({ success: true, data: result });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "SALES_CREATE");
  const body = await request.json();
  const validated = createSaleSchema.parse(body);
  const sale = await createSale({
    items: validated.items,
    discount: validated.discount,
    paymentMethod: validated.paymentMethod,
    createdById: session.userId,
  });
  return NextResponse.json({ success: true, data: sale }, { status: 201 });
});
