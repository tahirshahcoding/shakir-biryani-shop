import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createProductSchema,
  createSaleSchema,
  createExpenseSchema,
  createInventoryItemSchema,
  stockInSchema,
  adjustStockSchema,
  createUserSchema,
  createCategorySchema,
} from "./schemas";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "password" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("createProductSchema", () => {
  const valid = {
    name: "Chicken Biryani",
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    sellingPrice: 350,
  };

  it("accepts valid product", () => {
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional fields", () => {
    const withOptionals = { ...valid, description: "Delicious", costPrice: 200, unit: "pcs" };
    expect(createProductSchema.safeParse(withOptionals).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createProductSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects negative price", () => {
    expect(createProductSchema.safeParse({ ...valid, sellingPrice: -10 }).success).toBe(false);
  });

  it("rejects zero price", () => {
    expect(createProductSchema.safeParse({ ...valid, sellingPrice: 0 }).success).toBe(false);
  });

  it("rejects invalid UUID for categoryId", () => {
    expect(createProductSchema.safeParse({ ...valid, categoryId: "not-uuid" }).success).toBe(false);
  });
});

describe("createSaleSchema", () => {
  const validItem = { productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 };

  it("accepts valid sale", () => {
    expect(createSaleSchema.safeParse({ items: [validItem] }).success).toBe(true);
  });

  it("rejects empty cart", () => {
    expect(createSaleSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it("rejects more than 50 items", () => {
    const manyItems = Array.from({ length: 51 }, () => validItem);
    expect(createSaleSchema.safeParse({ items: manyItems }).success).toBe(false);
  });

  it("rejects zero quantity", () => {
    expect(createSaleSchema.safeParse({ items: [{ ...validItem, quantity: 0 }] }).success).toBe(false);
  });

  it("rejects negative quantity", () => {
    expect(createSaleSchema.safeParse({ items: [{ ...validItem, quantity: -1 }] }).success).toBe(false);
  });

  it("accepts valid payment methods", () => {
    for (const method of ["CASH", "CARD", "ONLINE", "OTHER"]) {
      expect(createSaleSchema.safeParse({ items: [validItem], paymentMethod: method }).success).toBe(true);
    }
  });

  it("rejects invalid payment method", () => {
    expect(createSaleSchema.safeParse({ items: [validItem], paymentMethod: "BITCOIN" }).success).toBe(false);
  });

  it("accepts non-negative discount", () => {
    expect(createSaleSchema.safeParse({ items: [validItem], discount: 100 }).success).toBe(true);
  });

  it("accepts zero discount", () => {
    expect(createSaleSchema.safeParse({ items: [validItem], discount: 0 }).success).toBe(true);
  });
});

describe("createExpenseSchema", () => {
  const valid = {
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 500,
  };

  it("accepts valid expense", () => {
    expect(createExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects zero amount", () => {
    expect(createExpenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(createExpenseSchema.safeParse({ ...valid, amount: -100 }).success).toBe(false);
  });

  it("rejects invalid categoryId", () => {
    expect(createExpenseSchema.safeParse({ ...valid, categoryId: "bad" }).success).toBe(false);
  });
});

describe("createInventoryItemSchema", () => {
  it("accepts valid item", () => {
    const result = createInventoryItemSchema.safeParse({ name: "Rice", unit: "kg" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createInventoryItemSchema.safeParse({ name: "", unit: "kg" }).success).toBe(false);
  });

  it("rejects empty unit", () => {
    expect(createInventoryItemSchema.safeParse({ name: "Rice", unit: "" }).success).toBe(false);
  });

  it("accepts optional quantities", () => {
    expect(createInventoryItemSchema.safeParse({ name: "Rice", unit: "kg", currentQuantity: 100, minimumQuantity: 10 }).success).toBe(true);
  });

  it("rejects negative currentQuantity", () => {
    expect(createInventoryItemSchema.safeParse({ name: "Rice", unit: "kg", currentQuantity: -5 }).success).toBe(false);
  });
});

describe("stockInSchema", () => {
  const valid = {
    inventoryItemId: "550e8400-e29b-41d4-a716-446655440000",
    quantity: 50,
    reason: "Purchase delivery",
  };

  it("accepts valid stock-in", () => {
    expect(stockInSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(stockInSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(stockInSchema.safeParse({ ...valid, reason: "" }).success).toBe(false);
  });
});

describe("adjustStockSchema", () => {
  const valid = {
    inventoryItemId: "550e8400-e29b-41d4-a716-446655440000",
    newQuantity: 50,
    reason: "Physical count correction",
  };

  it("accepts valid adjustment", () => {
    expect(adjustStockSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero newQuantity", () => {
    expect(adjustStockSchema.safeParse({ ...valid, newQuantity: 0 }).success).toBe(true);
  });

  it("rejects negative newQuantity", () => {
    expect(adjustStockSchema.safeParse({ ...valid, newQuantity: -5 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(adjustStockSchema.safeParse({ ...valid, reason: "" }).success).toBe(false);
  });
});

describe("createUserSchema", () => {
  const valid = {
    name: "Test User",
    email: "test@example.com",
    password: "secure123",
    roleId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts valid user", () => {
    expect(createUserSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short password", () => {
    expect(createUserSchema.safeParse({ ...valid, password: "12345" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createUserSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createUserSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});

describe("createCategorySchema", () => {
  it("accepts valid category", () => {
    expect(createCategorySchema.safeParse({ name: "Biryani" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createCategorySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts optional fields", () => {
    expect(createCategorySchema.safeParse({ name: "Biryani", description: "Rice dishes", sortOrder: 1 }).success).toBe(true);
  });
});
