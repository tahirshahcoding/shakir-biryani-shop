import { db } from "@/lib/db/prisma";

export type ProductRepositoryFilters = {
  categoryId?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function findMany(filters: ProductRepositoryFilters = {}) {
  const { categoryId, isAvailable, isActive = true, search, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (isAvailable !== undefined) where.isAvailable = isAvailable;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function findById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function findManyByIds(ids: string[]) {
  return db.product.findMany({
    where: { id: { in: ids }, isActive: true, isAvailable: true },
  });
}

export async function create(data: {
  name: string;
  description?: string;
  categoryId: string;
  sellingPrice: number;
  costPrice?: number;
  unit?: string;
  trackStock?: boolean;
}) {
  return db.product.create({
    data: {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      sellingPrice: data.sellingPrice,
      costPrice: data.costPrice,
      unit: data.unit || "piece",
      trackStock: data.trackStock !== undefined ? data.trackStock : true,
    },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    categoryId: string;
    sellingPrice: number;
    costPrice: number;
    unit: string;
    trackStock: boolean;
    isAvailable: boolean;
    isActive: boolean;
  }>
) {
  return db.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function countActive() {
  return db.product.count({ where: { isActive: true } });
}

export async function remove(id: string) {
  return db.product.update({ where: { id }, data: { isActive: false } });
}
