import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createProductSchema } from "@/lib/validation/schemas";
import { getProducts, createProduct } from "@/modules/products/product.service";
import { db } from "@/lib/db/prisma";
import { ZodError } from "zod";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "PRODUCTS_VIEW");
  const { searchParams } = new URL(request.url);

  if (searchParams.get("all") === "true") {
    const items = await db.product.findMany({
      where: { isActive: true, isAvailable: true },
      select: {
        id: true,
        name: true,
        description: true,
        sellingPrice: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: items });
  }

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
