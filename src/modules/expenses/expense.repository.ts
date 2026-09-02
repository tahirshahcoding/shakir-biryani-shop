import { db } from "@/lib/db/prisma";

export type ExpenseRepositoryFilters = {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export async function findMany(filters: ExpenseRepositoryFilters = {}) {
  const { categoryId, startDate, endDate, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) (where.expenseDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.expenseDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [items, total] = await Promise.all([
    db.expense.findMany({
      where,
      select: {
        id: true,
        categoryId: true,
        amount: true,
        description: true,
        paymentMethod: true,
        expenseDate: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.expense.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function findById(id: string) {
  return db.expense.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
  });
}

export async function create(data: {
  categoryId: string;
  amount: number;
  description?: string;
  paymentMethod: string;
  expenseDate: Date;
  createdById: string;
}) {
  return db.expense.create({
    data,
    include: { category: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
  });
}

export async function update(
  id: string,
  data: Partial<{ categoryId: string; amount: number; description: string; paymentMethod: string; expenseDate: Date }>
) {
  return db.expense.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function remove(id: string) {
  return db.expense.delete({ where: { id } });
}

export async function aggregate(where: Record<string, unknown>) {
  return db.expense.aggregate({ where, _sum: { amount: true }, _count: true });
}

export async function groupByCategory(where: Record<string, unknown>) {
  return db.expense.groupBy({ by: ["categoryId"], where, _sum: { amount: true }, _count: true });
}

// --- Expense Categories ---

export async function findManyCategories() {
  return db.expenseCategory.findMany({
    where: { isActive: true },
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });
}

export async function findCategoryById(id: string) {
  return db.expenseCategory.findUnique({ where: { id } });
}

export async function createCategory(data: { name: string; description?: string }) {
  return db.expenseCategory.create({ data });
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>
) {
  return db.expenseCategory.update({ where: { id }, data });
}
