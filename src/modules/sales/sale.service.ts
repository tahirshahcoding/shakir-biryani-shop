import { db } from "@/lib/db/prisma";
import * as saleRepo from "./sale.repository";
import crypto from "crypto";
import { BadRequestError, NotFoundError } from "@/lib/errors";

export type SaleFilters = saleRepo.SaleRepositoryFilters;

function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SB-${date}-${rand}`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function createSale(data: {
  items: { productId: string; quantity: number }[];
  discount?: number;
  paymentMethod?: string;
  createdById: string;
}) {
  if (!data.items || data.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  const productIds = data.items.map((i) => i.productId);
  const productRecords = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true, isAvailable: true },
  });

  if (productRecords.length !== productIds.length) {
    throw new BadRequestError("One or more products are unavailable");
  }

  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  return db.$transaction(async (tx) => {
    let subtotal = 0;
    const saleItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const quantity = Math.max(1, Math.floor(item.quantity));
      const unitPrice = roundCurrency(Number(product.sellingPrice));
      const itemSubtotal = roundCurrency(unitPrice * quantity);
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const discount = roundCurrency(Math.max(0, data.discount || 0));
    const total = roundCurrency(Math.max(0, subtotal - discount));
    const invoiceNumber = generateInvoiceNumber();

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        subtotal,
        discount,
        total,
        status: "COMPLETED",
        paymentMethod: data.paymentMethod || "CASH",
        createdById: data.createdById,
        items: { create: saleItems },
        payment: { create: { amount: total, method: data.paymentMethod || "CASH" } },
      },
      include: {
        items: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: data.createdById,
        action: "SALE_CREATED",
        entityType: "Sale",
        entityId: sale.id,
        metadata: JSON.stringify({ invoiceNumber, total, itemCount: saleItems.length }),
      },
    });

    return sale;
  });
}

export async function getSales(filters: SaleFilters = {}) {
  return saleRepo.findMany(filters);
}

export async function voidSale(id: string, voidedById: string) {
  return db.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({ where: { id }, include: { items: true } });
    if (!sale) throw new Error("Sale not found");
    if (sale.status === "VOIDED") throw new Error("Sale already voided");

    // Pre-fetch all related inventory items and check which products track stock
    const itemProductIds = sale.items.map((i) => i.productId);
    const [invItems, trackedProducts] = await Promise.all([
      tx.inventoryItem.findMany({ where: { id: { in: itemProductIds } } }),
      tx.product.findMany({ where: { id: { in: itemProductIds }, trackStock: true }, select: { id: true } }),
    ]);
    const invItemMap = new Map(invItems.map((i) => [i.id, i]));
    const trackedIds = new Set(trackedProducts.map((p) => p.id));

    // Build inventory restoration data in one pass
    const invUpdates: { id: string; prev: number; qty: number }[] = [];
    const txCreates: {
      inventoryItemId: string;
      type: string;
      quantity: number;
      previousQuantity: number;
      newQuantity: number;
      reason: string;
      createdById: string;
    }[] = [];

    for (const item of sale.items) {
      if (!trackedIds.has(item.productId)) continue;
      const invItem = invItemMap.get(item.productId);
      if (!invItem) continue;
      const prev = Number(invItem.currentQuantity);
      const newQty = prev + item.quantity;
      invUpdates.push({ id: invItem.id, prev, qty: item.quantity });
      txCreates.push({
        inventoryItemId: invItem.id,
        type: "RESTOCK",
        quantity: item.quantity,
        previousQuantity: prev,
        newQuantity: newQty,
        reason: `Void sale ${sale.invoiceNumber}`,
        createdById: voidedById,
      });
    }

    // Batch inventory updates: one raw query per item (sqlite doesn't support CASE well)
    // but batch the transaction log inserts
    for (const u of invUpdates) {
      await tx.$executeRaw`UPDATE InventoryItem SET currentQuantity = ${u.prev + u.qty} WHERE id = ${u.id}`;
    }
    if (txCreates.length > 0) {
      await tx.inventoryTransaction.createMany({ data: txCreates });
    }

    await tx.sale.update({ where: { id }, data: { status: "VOIDED" } });

    await tx.auditLog.create({
      data: {
        userId: voidedById,
        action: "SALE_VOIDED",
        entityType: "Sale",
        entityId: id,
        metadata: JSON.stringify({ invoiceNumber: sale.invoiceNumber, total: sale.total }),
      },
    });

    return tx.sale.findUnique({
      where: { id },
      include: { items: true, createdBy: { select: { id: true, name: true } } },
    });
  });
}

export async function getSaleById(id: string) {
  return saleRepo.findById(id);
}
