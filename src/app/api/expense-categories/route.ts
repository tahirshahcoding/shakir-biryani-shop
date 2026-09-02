import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createCategorySchema } from "@/lib/validation/schemas";
import { getExpenseCategories, createExpenseCategory } from "@/modules/expenses/expense.service";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_VIEW");
  const categories = await getExpenseCategories();
  return NextResponse.json({ success: true, data: categories });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_CREATE");
  const body = await request.json();
  const validated = createCategorySchema.parse(body);
  const category = await createExpenseCategory({ ...validated, createdById: session.userId });
  return NextResponse.json({ success: true, data: category }, { status: 201 });
});
