import { db } from "@/lib/db/prisma";

export type SaleRepositoryFilters = {
  status?: string;
  paymentMethod?: string;
  createdById?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function findMany(filters: SaleRepositoryFilters = {}) {
  const { status, paymentMethod, createdById, startDate, endDate, search, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (createdById) where.createdById = createdById;
  if (search) where.invoiceNumber = { contains: search };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [items, total] = await Promise.all([
    db.sale.findMany({
      where,
      select: {
        id: true,
        invoiceNumber: true,
        subtotal: true,
        discount: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: { select: { productName: true, quantity: true, unitPrice: true, subtotal: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.sale.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function findById(id: string) {
  return db.sale.findUnique({
    where: { id },
    include: {
      items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true, subtotal: true } },
      createdBy: { select: { id: true, name: true } },
      payment: { select: { amount: true, method: true } },
    },
  });
}

export async function findByIdWithItems(id: string) {
  return db.sale.findUnique({ where: { id }, include: { items: true } });
}

export async function createWithItems(data: {
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  createdById: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}) {
  return db.sale.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      subtotal: data.subtotal,
      discount: data.discount,
      total: data.total,
      status: "COMPLETED",
      paymentMethod: data.paymentMethod,
      createdById: data.createdById,
      items: { create: data.items },
      payment: { create: { amount: data.total, method: data.paymentMethod } },
    },
    include: {
      items: true,
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function updateStatus(id: string, status: string) {
  return db.sale.update({ where: { id }, data: { status } });
}

export async function count(where: Record<string, unknown> = {}) {
  return db.sale.count({ where });
}

export async function aggregate(where: Record<string, unknown>, opts?: { sum?: string[] }) {
  return db.sale.aggregate({
    where,
    _sum: opts?.sum ? Object.fromEntries(opts.sum.map((f) => [f, true])) : undefined,
    _count: true,
  });
}

// --- Transaction helpers (for $transaction callers) ---

export const txHelpers = {
  findByIdWithItems: (tx: typeof db, id: string) =>
    tx.sale.findUnique({ where: { id }, include: { items: true } }),

  updateStatus: (tx: typeof db, id: string, status: string) =>
    tx.sale.update({ where: { id }, data: { status } }),

  findUnique: (tx: typeof db, id: string) =>
    tx.sale.findUnique({
      where: { id },
      include: {
        items: true,
        createdBy: { select: { id: true, name: true } },
        payment: true,
      },
    }),
};
