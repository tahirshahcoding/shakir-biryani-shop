import { db } from "@/lib/db/prisma";
import * as inventoryRepo from "./inventory.repository";
import * as auditRepo from "@/modules/audit/audit.repository";

export type InventoryFilters = inventoryRepo.InventoryRepositoryFilters;

export async function getInventoryItems(filters: InventoryFilters = {}) {
  const { search, isLowStock, isActive, page = 1, pageSize = 25 } = filters;

  if (isLowStock) {
    const whereClauses = ['"isActive" = true', '"currentQuantity" <= "minimumQuantity"'];
    const params: unknown[] = [];
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

  return inventoryRepo.findMany({ search, isActive, page, pageSize });
}

export async function getInventoryItemById(id: string) {
  return inventoryRepo.findById(id);
}

export async function createInventoryItem(data: {
  name: string;
  unit: string;
  currentQuantity?: number;
  minimumQuantity?: number;
  createdById: string;
}) {
  const item = await inventoryRepo.create(data);

  await auditRepo.create({
    userId: data.createdById,
    action: "INVENTORY_ITEM_CREATED",
    entityType: "InventoryItem",
    entityId: item.id,
    metadata: { name: item.name },
  });

  return item;
}

export async function updateInventoryItem(
  id: string,
  data: Partial<{ name: string; unit: string; minimumQuantity: number; isActive: boolean }>,
  updatedById?: string
) {
  const item = await inventoryRepo.update(id, data);

  if (updatedById) {
    await auditRepo.create({
      userId: updatedById,
      action: "INVENTORY_ITEM_UPDATED",
      entityType: "InventoryItem",
      entityId: id,
      metadata: data,
    });
  }

  return item;
}

export async function addStock(
  inventoryItemId: string,
  quantity: number,
  reason: string,
  createdById: string
) {
  return db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } });
    if (!item) throw new Error("Inventory item not found");

    const previousQuantity = Number(item.currentQuantity);
    const newQuantity = previousQuantity + quantity;

    await tx.$executeRaw`
      UPDATE "InventoryItem" SET "currentQuantity" = ${newQuantity} WHERE id = ${inventoryItemId}
    `;

    const transaction = await tx.inventoryTransaction.create({
      data: { inventoryItemId, type: "STOCK_IN", quantity, previousQuantity, newQuantity, reason, createdById },
    });

    await tx.auditLog.create({
      data: { userId: createdById, action: "STOCK_ADDED", entityType: "InventoryItem", entityId: inventoryItemId, metadata: JSON.stringify({ quantity, newQuantity, reason }) },
    });

    return { item: { ...item, currentQuantity: newQuantity }, transaction };
  });
}

export async function adjustStock(
  inventoryItemId: string,
  newQuantity: number,
  reason: string,
  createdById: string
) {
  return db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } });
    if (!item) throw new Error("Inventory item not found");

    const previousQuantity = Number(item.currentQuantity);
    const delta = newQuantity - previousQuantity;

    await tx.$executeRaw`
      UPDATE "InventoryItem" SET "currentQuantity" = ${newQuantity} WHERE id = ${inventoryItemId}
    `;

    const transaction = await tx.inventoryTransaction.create({
      data: { inventoryItemId, type: "ADJUSTMENT", quantity: delta, previousQuantity, newQuantity, reason, createdById },
    });

    await tx.auditLog.create({
      data: { userId: createdById, action: "STOCK_ADJUSTED", entityType: "InventoryItem", entityId: inventoryItemId, metadata: JSON.stringify({ delta, newQuantity, reason }) },
    });

    return { item: { ...item, currentQuantity: newQuantity }, transaction };
  });
}

export async function restoreStock(
  tx: { inventoryItem: { findUnique: (args: { where: { id: string } }) => Promise<{ id: string; currentQuantity: number } | null>; update: (args: { where: { id: string }; data: { currentQuantity: number } }) => Promise<unknown> }; inventoryTransaction: { create: (args: unknown) => Promise<unknown> } },
  inventoryItemId: string,
  quantity: number,
  reason: string,
  createdById: string
) {
  const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } });
  if (!item) return;

  const previousQuantity = item.currentQuantity;
  const newQuantity = previousQuantity + quantity;

  await tx.inventoryItem.update({ where: { id: inventoryItemId }, data: { currentQuantity: newQuantity } });

  await tx.inventoryTransaction.create({
    data: { inventoryItemId, type: "RESTOCK", quantity, previousQuantity, newQuantity, reason, createdById },
  });
}

export async function getTransactions(
  inventoryItemId: string,
  filters: { startDate?: string; endDate?: string; type?: string; page?: number; pageSize?: number } = {}
) {
  return inventoryRepo.findTransactions(inventoryItemId, filters);
}

export async function deleteInventoryItem(id: string, deletedById: string) {
  const item = await inventoryRepo.update(id, { isActive: false });

  await auditRepo.create({
    userId: deletedById,
    action: "INVENTORY_ITEM_DELETED",
    entityType: "InventoryItem",
    entityId: id,
    metadata: { name: item.name },
  });

  return item;
}
