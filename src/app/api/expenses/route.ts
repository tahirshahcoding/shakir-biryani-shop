import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createExpenseSchema } from "@/lib/validation/schemas";
import { getExpenses, createExpense } from "@/modules/expenses/expense.service";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_VIEW");
  const { searchParams } = new URL(request.url);
  const result = await getExpenses({
    categoryId: searchParams.get("categoryId") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });
  return NextResponse.json({ success: true, data: result });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_CREATE");
  const body = await request.json();
  const validated = createExpenseSchema.parse(body);
  const expense = await createExpense({ ...validated, createdById: session.userId });
  return NextResponse.json({ success: true, data: expense }, { status: 201 });
});
