import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { createCategorySchema } from "@/lib/validation/schemas";
import { getCategoryById, updateCategory, deleteCategory } from "@/modules/categories/category.service";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "CATEGORIES_VIEW");
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) throw new NotFoundError("Category");
  return NextResponse.json({ success: true, data: category });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "CATEGORIES_EDIT");
  const { id } = await params;
  const body = await request.json();
  const validated = createCategorySchema.partial().parse(body);
  const category = await updateCategory(id, validated, session.userId);
  return NextResponse.json({ success: true, data: category });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "CATEGORIES_DELETE");
  const { id } = await params;
  await deleteCategory(id, session.userId);
  return NextResponse.json({ success: true });
});
