import { PrismaClient, Sale, SaleItem, User, Role, Product, Category } from "@prisma/client";

// ============================================================
// API Response Types
// ============================================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

// ============================================================
// Query Parameter Types
// ============================================================

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type SaleFilters = PaginationParams & {
  status?: "COMPLETED" | "VOIDED";
  paymentMethod?: "CASH" | "CARD" | "ONLINE" | "OTHER";
  createdById?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
};

export type ProductFilters = PaginationParams & {
  categoryId?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  search?: string;
};

export type ExpenseFilters = PaginationParams & {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export type InventoryFilters = PaginationParams & {
  isActive?: boolean;
  isLowStock?: boolean;
};

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
};

// ============================================================
// Input Types
// ============================================================

export type CreateSaleInput = {
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  paymentMethod?: "CASH" | "CARD" | "ONLINE" | "OTHER";
};

export type CreateProductInput = {
  name: string;
  description?: string;
  categoryId: string;
  sellingPrice: number;
  costPrice?: number;
  unit?: string;
};

export type CreateExpenseInput = {
  categoryId: string;
  amount: number;
  description?: string;
  paymentMethod?: "CASH" | "CARD" | "ONLINE" | "OTHER";
  expenseDate?: string;
};

export type CreateInventoryTransactionInput = {
  inventoryItemId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  reason?: string;
};

// ============================================================
// Report Types
// ============================================================

export type DailySalesSummary = {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
};

export type ProductSalesSummary = {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type DashboardData = {
  todaySales: number;
  todayRevenue: number;
  todayExpenses: number;
  lowStockItems: number;
  recentSales: Sale[];
  topProducts: ProductSalesSummary[];
};

// ============================================================
// Auth Types
// ============================================================

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export type LoginInput = {
  email: string;
  password: string;
};

// ============================================================
// Prisma Relation Types
// ============================================================

export type SaleWithItems = Sale & {
  items: SaleItem[];
  createdBy: User;
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type UserWithRole = User & {
  role: Role;
};
