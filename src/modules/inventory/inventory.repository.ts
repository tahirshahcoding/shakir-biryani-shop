import { db } from "@/lib/db/prisma";

export type InventoryRepositoryFilters = {
  search?: string;
  isLowStock?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

export async function findMany(filters: InventoryRepositoryFilters = {}) {
  const { search, isActive = true, isLowStock, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};
  if (isActive !== undefined) where.isActive = isActive;
  if (search) where.OR = [{ name: { contains: search } }];

  const [items, total] = await Promise.all([
    db.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.inventoryItem.count({ where }),
  ]);

  const filtered = isLowStock
    ? items.filter((item) => item.currentQuantity <= item.minimumQuantity)
    : items;

  return { items: filtered, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function findById(id: string) {
  return db.inventoryItem.findUnique({ where: { id } });
}

export async function create(data: {
  name: string;
  unit: string;
  currentQuantity?: number;
  minimumQuantity?: number;
}) {
  return db.inventoryItem.create({ data });
}

export async function update(
  id: string,
  data: Partial<{ name: string; unit: string; minimumQuantity: number; isActive: boolean }>
) {
  return db.inventoryItem.update({ where: { id }, data });
}

export async function findManyActive() {
  return db.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

// Transaction helpers for inventory operations
export const txHelpers = {
  findUnique: (tx: typeof db, id: string) =>
    tx.inventoryItem.findUnique({ where: { id } }),

  updateQuantity: (tx: typeof db, id: string, newQuantity: number) =>
    tx.inventoryItem.update({ where: { id }, data: { currentQuantity: newQuantity } }),

  createTransaction: (tx: typeof db, data: {
    inventoryItemId: string;
    type: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    createdById: string;
  }) => tx.inventoryTransaction.create({ data }),

  findFirstByName: (tx: typeof db, name: string) =>
    tx.inventoryItem.findFirst({ where: { name } }),
};

export async function findTransactions(
  inventoryItemId: string,
  filters: { startDate?: string; endDate?: string; type?: string; page?: number; pageSize?: number } = {}
) {
  const { startDate, endDate, type, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = { inventoryItemId };
  if (type) where.type = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [items, total] = await Promise.all([
    db.inventoryTransaction.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.inventoryTransaction.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
