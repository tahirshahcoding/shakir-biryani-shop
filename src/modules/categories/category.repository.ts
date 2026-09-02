import { db } from "@/lib/db/prisma";

export async function findManyActive() {
  return db.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findById(id: string) {
  return db.category.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        select: { id: true, name: true, sellingPrice: true, isAvailable: true },
      },
    },
  });
}

export async function create(data: { name: string; description?: string; sortOrder?: number }) {
  return db.category.create({ data });
}

export async function findByName(name: string) {
  return db.category.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
}

export async function update(
  id: string,
  data: Partial<{ name: string; description: string; sortOrder: number; isActive: boolean }>
) {
  return db.category.update({ where: { id }, data });
}

export async function remove(id: string) {
  return db.category.update({ where: { id }, data: { isActive: false } });
}
