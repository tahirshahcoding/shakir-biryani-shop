import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { updateProductSchema } from "@/lib/validation/schemas";
import { getProductById, updateProduct, deleteProduct } from "@/modules/products/product.service";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "PRODUCTS_VIEW");
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) throw new NotFoundError("Product");
  return NextResponse.json({ success: true, data: product });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "PRODUCTS_EDIT");
  const { id } = await params;
  const body = await request.json();
  const validated = updateProductSchema.parse(body);
  const product = await updateProduct(id, validated, session.userId);
  return NextResponse.json({ success: true, data: product });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "PRODUCTS_DELETE");
  const { id } = await params;
  await deleteProduct(id, session.userId);
  return NextResponse.json({ success: true });
});
