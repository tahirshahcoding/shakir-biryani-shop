import { db } from "@/lib/db/prisma";
import * as saleRepo from "./sale.repository";
import crypto from "crypto";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { findValue } from "@/modules/settings/setting.repository";

export type SaleFilters = saleRepo.SaleRepositoryFilters;

async function generateInvoiceNumber(): Promise<string> {
  const prefix = ((await findValue("INVOICE_PREFIX")) || "SB").toUpperCase();
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${date}-${rand}`;
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

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const productRecords = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true, isAvailable: true },
    select: { id: true, name: true, sellingPrice: true },
  });

  if (productRecords.length !== productIds.length) {
    throw new BadRequestError("One or more products are unavailable");
  }

  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  const mergeItems = data.items.reduce<Map<string, number>>((acc, item) => {
    acc.set(item.productId, (acc.get(item.productId) || 0) + Math.max(1, Math.floor(item.quantity)));
    return acc;
  }, new Map());

  return db.$transaction(async (tx) => {
    let subtotal = 0;
    const saleItems = [...mergeItems.entries()].map(([productId, quantity]) => {
      const product = productMap.get(productId)!;
      const unitPrice = roundCurrency(Number(product.sellingPrice));
      const itemSubtotal = roundCurrency(unitPrice * quantity);
      subtotal += itemSubtotal;

      return {
        productId,
        productName: product.name,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const discount = roundCurrency(Math.max(0, data.discount || 0));
    const total = roundCurrency(Math.max(0, subtotal - discount));
    const invoiceNumber = await generateInvoiceNumber();

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
    const sale = await tx.sale.findUnique({
      where: { id },
      include: {
        items: { select: { id: true, productId: true, productName: true, quantity: true, subtotal: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw new NotFoundError("Sale");
    if (sale.status === "VOIDED") throw new BadRequestError("Sale already voided");

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

    return { ...sale, status: "VOIDED" as const };
  });
}

export async function getSaleById(id: string) {
  return saleRepo.findById(id);
}
