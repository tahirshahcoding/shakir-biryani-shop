import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { updateExpenseSchema } from "@/lib/validation/schemas";
import { getExpenseById, updateExpense, deleteExpense } from "@/modules/expenses/expense.service";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  await requireSession();
  const { id } = await params;
  const expense = await getExpenseById(id);
  if (!expense) throw new NotFoundError("Expense");
  return NextResponse.json({ success: true, data: expense });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_EDIT");
  const { id } = await params;
  const body = await request.json();
  const validated = updateExpenseSchema.parse(body);
  const expense = await updateExpense(id, validated, session.userId);
  return NextResponse.json({ success: true, data: expense });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "EXPENSES_DELETE");
  const { id } = await params;
  await deleteExpense(id, session.userId);
  return NextResponse.json({ success: true });
});
