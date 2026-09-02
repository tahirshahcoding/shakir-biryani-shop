import * as categoryRepo from "./category.repository";
import * as auditRepo from "@/modules/audit/audit.repository";
import { ConflictError } from "@/lib/errors";

export async function getCategories() {
  return categoryRepo.findManyActive();
}

export async function getCategoryById(id: string) {
  return categoryRepo.findById(id);
}

export async function createCategory(data: {
  name: string;
  description?: string;
  sortOrder?: number;
  createdById: string;
}) {
  const { createdById, ...repoData } = data;
  const existing = await categoryRepo.findByName(data.name);
  if (existing) {
    if (existing.isActive) {
      throw new ConflictError(`A category named "${data.name}" already exists`);
    }
    const reactivated = await categoryRepo.update(existing.id, { ...repoData, isActive: true });
    await auditRepo.create({
      userId: createdById,
      action: "CATEGORY_REACTIVATED",
      entityType: "Category",
      entityId: existing.id,
      metadata: { name: existing.name },
    });
    return reactivated;
  }

  const category = await categoryRepo.create(repoData);

  await auditRepo.create({
    userId: createdById,
    action: "CATEGORY_CREATED",
    entityType: "Category",
    entityId: category.id,
    metadata: { name: category.name },
  });

  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; description: string; sortOrder: number; isActive: boolean }>,
  updatedById?: string
) {
  const category = await categoryRepo.update(id, data);

  if (updatedById) {
    await auditRepo.create({
      userId: updatedById,
      action: "CATEGORY_UPDATED",
      entityType: "Category",
      entityId: id,
      metadata: data,
    });
  }

  return category;
}

export async function deleteCategory(id: string, deletedById: string) {
  const category = await categoryRepo.remove(id);

  await auditRepo.create({
    userId: deletedById,
    action: "CATEGORY_DELETED",
    entityType: "Category",
    entityId: id,
    metadata: { name: category.name },
  });

  return category;
}
