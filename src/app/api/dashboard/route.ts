import { NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { db } from "@/lib/db/prisma";
import { findNumber } from "@/modules/settings/setting.repository";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "DASHBOARD_VIEW");

  const today = new Date();
  const todayStart = new Date(today.toISOString().slice(0, 10));
  const tomorrow = new Date(todayStart);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const lowStockThreshold = (await findNumber("LOW_STOCK_THRESHOLD")) ?? 0;

  const [todaySales, todayExpenses, recentSales, topProductsData, lowStockItems, totalProducts] = await Promise.all([
    db.sale.aggregate({
      where: { createdAt: { gte: todayStart, lt: tomorrow }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    db.expense.aggregate({
      where: { expenseDate: { gte: todayStart, lt: tomorrow } },
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
      where: { sale: { status: "COMPLETED", createdAt: { gte: todayStart, lt: tomorrow } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    db.$queryRawUnsafe<{ name: string; currentQuantity: number; minimumQuantity: number; unit: string }[]>(
      `SELECT name, "currentQuantity", "minimumQuantity", unit FROM "InventoryItem" WHERE "isActive" = true AND "currentQuantity" <= GREATEST("minimumQuantity", ${lowStockThreshold}) ORDER BY "currentQuantity" ASC LIMIT 10`
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
    }));

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
  }, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
});
