import { db } from "@/lib/db/prisma";
import * as inventoryRepo from "./inventory.repository";
import * as auditRepo from "@/modules/audit/audit.repository";
import { NotFoundError } from "@/lib/errors";

export type InventoryFilters = inventoryRepo.InventoryRepositoryFilters;

export async function getInventoryItems(filters: InventoryFilters = {}) {
  const { search, isLowStock, lowStockThreshold, isActive, page, pageSize } = filters;
  return inventoryRepo.findMany({ search, isLowStock, lowStockThreshold, isActive, page, pageSize });
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
  const { createdById, ...repoData } = data;
  const item = await inventoryRepo.create(repoData);

  await auditRepo.create({
    userId: createdById,
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
    if (!item) throw new NotFoundError("Inventory item");

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { currentQuantity: { increment: quantity } },
    });

    const newQuantity = Number(updated.currentQuantity);
    const previousQuantity = newQuantity - quantity;

    const transaction = await tx.inventoryTransaction.create({
      data: { inventoryItemId, type: "STOCK_IN", quantity, previousQuantity, newQuantity, reason, createdById },
    });

    await tx.auditLog.create({
      data: { userId: createdById, action: "STOCK_ADDED", entityType: "InventoryItem", entityId: inventoryItemId, metadata: JSON.stringify({ quantity, newQuantity, reason }) },
    });

    return { item: updated, transaction };
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
    if (!item) throw new NotFoundError("Inventory item");

    const previousQuantity = Number(item.currentQuantity);
    const delta = newQuantity - previousQuantity;
    const adjusted = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { currentQuantity: newQuantity },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: { inventoryItemId, type: "ADJUSTMENT", quantity: delta, previousQuantity, newQuantity, reason, createdById },
    });

    await tx.auditLog.create({
      data: { userId: createdById, action: "STOCK_ADJUSTED", entityType: "InventoryItem", entityId: inventoryItemId, metadata: JSON.stringify({ delta, newQuantity, reason }) },
    });

    return { item: adjusted, transaction };
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
