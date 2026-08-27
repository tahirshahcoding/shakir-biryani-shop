import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).nullish().transform(v => v ?? undefined),
  categoryId: z.string().uuid("Invalid category"),
  sellingPrice: z.number().positive("Price must be positive"),
  costPrice: z.number().nonnegative().nullish().transform(v => v ?? undefined),
  unit: z.string().max(20).nullish().transform(v => v ?? undefined),
  trackStock: z.boolean().nullish().transform(v => v ?? undefined),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).nullish().transform(v => v ?? undefined),
  description: z.string().max(1000).nullish().transform(v => v ?? undefined),
  categoryId: z.string().uuid().nullish().transform(v => v ?? undefined),
  sellingPrice: z.number().positive().nullish().transform(v => v ?? undefined),
  costPrice: z.number().nonnegative().nullish().transform(v => v ?? undefined),
  unit: z.string().max(20).nullish().transform(v => v ?? undefined),
  trackStock: z.boolean().nullish().transform(v => v ?? undefined),
  isAvailable: z.boolean().nullish().transform(v => v ?? undefined),
  isActive: z.boolean().nullish().transform(v => v ?? undefined),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullish().transform(v => v ?? undefined),
  sortOrder: z.number().int().nullish().transform(v => v ?? undefined),
});

export const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  })).min(1, "Cart cannot be empty").max(50, "Too many items"),
  discount: z.number().nonnegative().nullish().transform(v => v ?? undefined),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).nullish().transform(v => v ?? undefined),
});

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid("Invalid category"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500).nullish().transform(v => v ?? undefined),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).nullish().transform(v => v ?? undefined),
  expenseDate: z.string().nullish().transform(v => v ?? undefined),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid().nullish().transform(v => v ?? undefined),
  amount: z.number().positive().nullish().transform(v => v ?? undefined),
  description: z.string().max(500).nullish().transform(v => v ?? undefined),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).nullish().transform(v => v ?? undefined),
  expenseDate: z.string().nullish().transform(v => v ?? undefined),
});

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  unit: z.string().min(1, "Unit is required").max(20),
  currentQuantity: z.number().nonnegative().nullish().transform(v => v ?? undefined),
  minimumQuantity: z.number().nonnegative().nullish().transform(v => v ?? undefined),
});

export const stockInSchema = z.object({
  inventoryItemId: z.string().uuid("Invalid item"),
  quantity: z.number().positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export const adjustStockSchema = z.object({
  inventoryItemId: z.string().uuid("Invalid item"),
  newQuantity: z.number().nonnegative("Quantity cannot be negative"),
  reason: z.string().min(1, "Reason is required for adjustments").max(500),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().uuid("Invalid role"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).nullish().transform(v => v ?? undefined),
  email: z.string().email().nullish().transform(v => v ?? undefined),
  password: z.string().min(6).nullish().transform(v => v ?? undefined),
  roleId: z.string().uuid().nullish().transform(v => v ?? undefined),
  isActive: z.boolean().nullish().transform(v => v ?? undefined),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()).min(1, "At least one permission is required"),
});
