import { db } from "@/lib/db/prisma";

export async function findMany(options: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { search, page = 1, pageSize = 25 } = options;

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function findById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function findByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      isActive: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function create(data: {
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
}) {
  return db.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function update(
  id: string,
  data: Partial<{ name: string; email: string; passwordHash: string; roleId: string; isActive: boolean }>
) {
  return db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function deactivate(id: string) {
  return db.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function countActive() {
  return db.user.count({ where: { isActive: true } });
}

export async function findRoles() {
  return db.role.findMany({ select: { id: true, name: true, description: true } });
}
