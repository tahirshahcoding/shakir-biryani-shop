import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createInventoryItemSchema, stockInSchema, adjustStockSchema } from "@/lib/validation/schemas";
import { getInventoryItems, createInventoryItem, addStock, adjustStock } from "@/modules/inventory/inventory.service";
import { findNumber } from "@/modules/settings/setting.repository";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "INVENTORY_VIEW");
  const { searchParams } = new URL(request.url);
  const lowStockThreshold = (await findNumber("LOW_STOCK_THRESHOLD")) ?? 0;
  const result = await getInventoryItems({
    search: searchParams.get("search") || undefined,
    isLowStock: searchParams.get("isLowStock") === "true",
    lowStockThreshold,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });
  return NextResponse.json({ success: true, data: result });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "INVENTORY_ADJUST");
  const body = await request.json();

  if (body.action === "stock-in") {
    const validated = stockInSchema.parse(body);
    const result = await addStock(validated.inventoryItemId, validated.quantity, validated.reason, session.userId);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  }

  if (body.action === "adjust") {
    const validated = adjustStockSchema.parse(body);
    const result = await adjustStock(validated.inventoryItemId, validated.newQuantity, validated.reason, session.userId);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  }

  const validated = createInventoryItemSchema.parse(body);
  const item = await createInventoryItem({ ...validated, createdById: session.userId });
  return NextResponse.json({ success: true, data: item }, { status: 201 });
});
