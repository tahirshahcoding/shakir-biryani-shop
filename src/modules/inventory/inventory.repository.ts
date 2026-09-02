import { db } from "@/lib/db/prisma";

export type InventoryRepositoryFilters = {
  search?: string;
  isLowStock?: boolean;
  lowStockThreshold?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

export async function findMany(filters: InventoryRepositoryFilters = {}) {
  const { search, isActive = true, isLowStock, lowStockThreshold = 0, page = 1, pageSize = 25 } = filters;

  if (isLowStock) {
    const whereClauses = ['"isActive" = true', '"currentQuantity" <= GREATEST("minimumQuantity", $1::float8)'];
    const params: unknown[] = [lowStockThreshold];
    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`name ILIKE $${params.length}`);
    }
    const where = whereClauses.join(" AND ");
    const offset = (page - 1) * pageSize;

    const [items, countResult] = await Promise.all([
      db.$queryRawUnsafe<{ id: string; name: string; unit: string; currentQuantity: number; minimumQuantity: number }[]>(
        `SELECT id, name, unit, "currentQuantity", "minimumQuantity" FROM "InventoryItem" WHERE ${where} ORDER BY name ASC LIMIT ${pageSize} OFFSET ${offset}`,
        ...params
      ),
      db.$queryRawUnsafe<{ cnt: bigint }[]>(
        `SELECT COUNT(*) as cnt FROM "InventoryItem" WHERE ${where}`,
        ...params
      ),
    ]);

    const total = Number(countResult[0]?.cnt ?? 0);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

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

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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
    select: { id: true, name: true, unit: true, currentQuantity: true, minimumQuantity: true },
    orderBy: { name: "asc" },
  });
}

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
