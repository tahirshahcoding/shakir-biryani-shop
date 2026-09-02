import * as expenseRepo from "./expense.repository";
import * as auditRepo from "@/modules/audit/audit.repository";
import { db } from "@/lib/db/prisma";
import { BadRequestError } from "@/lib/errors";

export type ExpenseFilters = expenseRepo.ExpenseRepositoryFilters;

export async function getExpenses(filters: ExpenseFilters = {}) {
  return expenseRepo.findMany(filters);
}

export async function getExpenseById(id: string) {
  return expenseRepo.findById(id);
}

export async function createExpense(data: {
  categoryId: string;
  amount: number;
  description?: string;
  paymentMethod?: string;
  expenseDate?: string;
  createdById: string;
}) {
  const category = await expenseRepo.findCategoryById(data.categoryId);
  if (!category || !category.isActive) throw new BadRequestError("Invalid expense category");

  const expense = await expenseRepo.create({
    categoryId: data.categoryId,
    amount: data.amount,
    description: data.description,
    paymentMethod: data.paymentMethod || "CASH",
    expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
    createdById: data.createdById,
  });

  await auditRepo.create({
    userId: data.createdById,
    action: "EXPENSE_CREATED",
    entityType: "Expense",
    entityId: expense.id,
    metadata: { amount: data.amount, categoryId: data.categoryId } as Record<string, unknown>,
  });

  return expense;
}

export async function updateExpense(
  id: string,
  data: Partial<{ categoryId: string; amount: number; description: string; paymentMethod: string; expenseDate: string }>,
  updatedById?: string
) {
  const expense = await expenseRepo.update(id, {
    ...data,
    expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
  } as never);

  if (updatedById) {
    await auditRepo.create({
      userId: updatedById,
      action: "EXPENSE_UPDATED",
      entityType: "Expense",
      entityId: id,
      metadata: data,
    });
  }

  return expense;
}

export async function deleteExpense(id: string, deletedById: string) {
  await auditRepo.create({
    userId: deletedById,
    action: "EXPENSE_DELETED",
    entityType: "Expense",
    entityId: id,
    metadata: undefined,
  });
  return expenseRepo.remove(id);
}

export async function getExpenseCategories() {
  return expenseRepo.findManyCategories();
}

export async function createExpenseCategory(data: { name: string; description?: string; createdById: string }) {
  const { createdById, ...repoData } = data;
  const category = await expenseRepo.createCategory(repoData);

  await auditRepo.create({
    userId: createdById,
    action: "EXPENSE_CATEGORY_CREATED",
    entityType: "ExpenseCategory",
    entityId: category.id,
    metadata: { name: category.name },
  });

  return category;
}

export async function updateExpenseCategory(
  id: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>
) {
  return expenseRepo.updateCategory(id, data);
}

export async function getExpenseSummary(startDate?: string, endDate?: string) {
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) (where.expenseDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.expenseDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [totalResult, byCategory] = await Promise.all([
    expenseRepo.aggregate(where),
    expenseRepo.groupByCategory(where),
  ]);

  const categoryIds = byCategory.map((r) => r.categoryId);
  const categories = await db.expenseCategory.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return {
    total: Number(totalResult._sum.amount) || 0,
    count: totalResult._count,
    byCategory: byCategory.map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId) || "Unknown",
      total: Number(r._sum.amount) || 0,
      count: r._count,
    })),
  };
}
