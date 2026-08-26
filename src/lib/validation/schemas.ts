import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid("Invalid category"),
  sellingPrice: z.number().positive("Price must be positive"),
  costPrice: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
  trackStock: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid().optional(),
  sellingPrice: z.number().positive().optional(),
  costPrice: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
  trackStock: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
});

export const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  })).min(1, "Cart cannot be empty").max(50, "Too many items"),
  discount: z.number().nonnegative().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).optional(),
});

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid("Invalid category"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500).optional(),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).optional(),
  expenseDate: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "OTHER"]).optional(),
  expenseDate: z.string().optional(),
});

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  unit: z.string().min(1, "Unit is required").max(20),
  currentQuantity: z.number().nonnegative().optional(),
  minimumQuantity: z.number().nonnegative().optional(),
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
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()).min(1, "At least one permission is required"),
});
