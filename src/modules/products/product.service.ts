import * as productRepo from "./product.repository";
import * as auditRepo from "@/modules/audit/audit.repository";

export type ProductFilters = productRepo.ProductRepositoryFilters;

export async function getProducts(filters: ProductFilters = {}) {
  return productRepo.findMany(filters);
}

export async function getProductById(id: string) {
  return productRepo.findById(id);
}

export async function createProduct(data: {
  name: string;
  description?: string;
  categoryId: string;
  sellingPrice: number;
  costPrice?: number;
  unit?: string;
  trackStock?: boolean;
  createdById: string;
}) {
  const product = await productRepo.create(data);

  await auditRepo.create({
    userId: data.createdById,
    action: "PRODUCT_CREATED",
    entityType: "Product",
    entityId: product.id,
    metadata: { name: product.name },
  });

  return product;
}

export async function updateProduct(
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
  }>,
  updatedById?: string
) {
  const product = await productRepo.update(id, data);

  if (updatedById) {
    await auditRepo.create({
      userId: updatedById,
      action: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: id,
      metadata: data,
    });
  }

  return product;
}

export async function deleteProduct(id: string, deletedById: string) {
  const product = await productRepo.remove(id);

  await auditRepo.create({
    userId: deletedById,
    action: "PRODUCT_DELETED",
    entityType: "Product",
    entityId: id,
    metadata: { name: product.name },
  });

  return product;
}
