import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createProductSchema } from "@/lib/validation/schemas";
import { getProducts, createProduct } from "@/modules/products/product.service";
import { ZodError } from "zod";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const result = await getProducts({
    categoryId: searchParams.get("categoryId") || undefined,
    search: searchParams.get("search") || undefined,
    isAvailable: searchParams.get("isAvailable") ? searchParams.get("isAvailable") === "true" : undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });
  return NextResponse.json({ success: true, data: result });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "PRODUCTS_CREATE");
  const body = await request.json();
  const validated = createProductSchema.parse(body);
  const product = await createProduct({ ...validated, createdById: session.userId });
  return NextResponse.json({ success: true, data: product }, { status: 201 });
});
