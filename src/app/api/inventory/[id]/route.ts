import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { createInventoryItemSchema } from "@/lib/validation/schemas";
import { getInventoryItemById, updateInventoryItem, deleteInventoryItem } from "@/modules/inventory/inventory.service";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  await requireSession();
  const { id } = await params;
  const item = await getInventoryItemById(id);
  if (!item) throw new NotFoundError("Inventory item");
  return NextResponse.json({ success: true, data: item });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "INVENTORY_ADJUST");
  const { id } = await params;
  const body = await request.json();
  const validated = createInventoryItemSchema.partial().parse(body);
  const item = await updateInventoryItem(id, validated, session.userId);
  return NextResponse.json({ success: true, data: item });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "INVENTORY_ADJUST");
  const { id } = await params;
  await deleteInventoryItem(id, session.userId);
  return NextResponse.json({ success: true });
});
