import { db } from "@/lib/db/prisma";

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
};

export async function getSalesReport(filters: ReportFilters = {}) {
  const { startDate, endDate } = filters;

  const where: Record<string, unknown> = { status: "COMPLETED" };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [summary, byPaymentMethod] = await Promise.all([
    db.sale.aggregate({
      where,
      _sum: { total: true, discount: true, subtotal: true },
      _count: true,
    }),
    db.sale.groupBy({
      by: ["paymentMethod"],
      where,
      _sum: { total: true },
      _count: true,
    }),
  ]);

  return {
    totalRevenue: Number(summary._sum.total) || 0,
    totalDiscount: Number(summary._sum.discount) || 0,
    totalSubtotal: Number(summary._sum.subtotal) || 0,
    totalSales: summary._count,
    averageSale: summary._count > 0 ? (Number(summary._sum.total) || 0) / summary._count : 0,
    byPaymentMethod: byPaymentMethod.map((r) => ({
      method: r.paymentMethod,
      total: Number(r._sum.total) || 0,
      count: r._count,
    })),
  };
}

export async function getExpenseReport(filters: ReportFilters = {}) {
  const { startDate, endDate } = filters;

  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) (where.expenseDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.expenseDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [summary, byCategory] = await Promise.all([
    db.expense.aggregate({ where, _sum: { amount: true }, _count: true }),
    db.expense.groupBy({ by: ["categoryId"], where, _sum: { amount: true }, _count: true }),
  ]);

  const categoryIds = byCategory.map((r) => r.categoryId);
  const categories = await db.expenseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return {
    totalExpenses: Number(summary._sum.amount) || 0,
    count: summary._count,
    byCategory: byCategory.map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId) || "Unknown",
      total: Number(r._sum.amount) || 0,
      count: r._count,
    })),
  };
}

export async function getInventoryReport() {
  const items = await db.inventoryItem.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      unit: true,
      currentQuantity: true,
      minimumQuantity: true,
    },
    orderBy: { name: "asc" },
  });

  const lowStock = items.filter((i) => Number(i.currentQuantity) <= Number(i.minimumQuantity));
  const outOfStock = items.filter((i) => Number(i.currentQuantity) === 0);

  return {
    totalItems: items.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      currentQuantity: Number(i.currentQuantity),
      minimumQuantity: Number(i.minimumQuantity),
      status:
        Number(i.currentQuantity) === 0
          ? "OUT_OF_STOCK"
          : Number(i.currentQuantity) <= Number(i.minimumQuantity)
          ? "LOW_STOCK"
          : "IN_STOCK",
    })),
  };
}

export async function getProductReport(filters: ReportFilters = {}) {
  const { startDate, endDate } = filters;

  const where: Record<string, unknown> = { status: "COMPLETED" };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const rows = await db.saleItem.groupBy({
    by: ["productId", "productName"],
    where: { sale: where as never },
    _sum: { quantity: true, subtotal: true },
  });

  const productIds = rows.map((r) => r.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, costPrice: true },
  });
  const costMap = new Map(products.map((p) => [p.id, Number(p.costPrice) || 0]));

  return rows
    .map((r) => {
      const totalQuantity = r._sum.quantity || 0;
      const totalRevenue = Number(r._sum.subtotal) || 0;
      const totalCost = (costMap.get(r.productId) || 0) * totalQuantity;
      return {
        productId: r.productId,
        name: r.productName,
        totalQuantity,
        totalRevenue,
        totalCost,
        profit: totalRevenue - totalCost,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
