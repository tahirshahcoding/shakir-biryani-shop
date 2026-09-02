import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createCategorySchema } from "@/lib/validation/schemas";
import { getCategories, createCategory } from "@/modules/categories/category.service";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "CATEGORIES_VIEW");
  const categories = await getCategories();
  return NextResponse.json({ success: true, data: categories });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "CATEGORIES_CREATE");
  const body = await request.json();
  const validated = createCategorySchema.parse(body);
  const category = await createCategory({ ...validated, createdById: session.userId });
  return NextResponse.json({ success: true, data: category }, { status: 201 });
});
