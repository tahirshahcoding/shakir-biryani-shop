import { NextResponse } from "next/server";
import { withErrorHandling, requireSession } from "@/lib/errors/api-handler";
import { db } from "@/lib/db/prisma";

export const GET = withErrorHandling(async () => {
  await requireSession();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todaySales, todayExpenses, recentSales, topProductsData, lowStockItems, totalProducts] = await Promise.all([
    db.sale.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    db.expense.aggregate({
      where: { expenseDate: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),
    db.sale.findMany({
      where: { status: "COMPLETED" },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.saleItem.groupBy({
      by: ["productId", "productName"],
      where: { sale: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } } },
      _sum: { quantity: true, subtotal: true },
    }),
    db.$queryRawUnsafe<{ name: string; currentQuantity: number; minimumQuantity: number; unit: string }[]>(
      "SELECT name, currentQuantity, minimumQuantity, unit FROM InventoryItem WHERE \"isActive\" = true AND \"currentQuantity\" <= \"minimumQuantity\" ORDER BY \"currentQuantity\" ASC LIMIT 10"
    ),
    db.product.count({ where: { isActive: true } }),
  ]);

  const todayRevenue = Number(todaySales._sum.total) || 0;
  const todayExpenseTotal = Number(todayExpenses._sum.amount) || 0;

  const topProducts = topProductsData
    .map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: item._sum.quantity || 0,
      totalRevenue: Number(item._sum.subtotal) || 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const lowStock = lowStockItems;

  return NextResponse.json({
    success: true,
    data: {
      todaySales: todaySales._count,
      todayRevenue,
      todayExpenses: todayExpenseTotal,
      profit: todayRevenue - todayExpenseTotal,
      totalProducts,
      topProducts,
      lowStockItems: lowStock,
      recentSales,
    },
  });
});
