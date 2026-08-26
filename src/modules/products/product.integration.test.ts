import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDbMock } from "@/lib/db/__mocks/prisma";

vi.mock("@/lib/db/prisma", () => ({ db: createDbMock() }));
vi.mock("@/modules/audit/audit.repository", () => ({ create: vi.fn().mockResolvedValue({ id: "audit-1" }) }));

import { db } from "@/lib/db/prisma";
import * as productService from "./product.service";

const m = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("product.service integration", () => {
  const mockProduct = {
    id: "prod-1",
    name: "Chicken Biryani",
    description: "Spicy",
    sellingPrice: 350,
    costPrice: 200,
    unit: "pcs",
    isActive: true,
    isAvailable: true,
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Biryani" },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("creates a product through the service", async () => {
    m.product.create.mockResolvedValue(mockProduct);
    const result = await productService.createProduct({
      name: "Chicken Biryani",
      categoryId: "cat-1",
      sellingPrice: 350,
      createdById: "user-1",
    });
    expect(result.name).toBe("Chicken Biryani");
    expect(m.product.create).toHaveBeenCalledOnce();
  });

  it("finds a product by ID", async () => {
    m.product.findUnique.mockResolvedValue(mockProduct);
    const result = await productService.getProductById("prod-1");
    expect(result?.id).toBe("prod-1");
  });

  it("returns null for non-existent product", async () => {
    m.product.findUnique.mockResolvedValue(null);
    const result = await productService.getProductById("nonexistent");
    expect(result).toBeNull();
  });

  it("lists products with pagination", async () => {
    m.product.findMany.mockResolvedValue([mockProduct]);
    m.product.count.mockResolvedValue(1);
    const result = await productService.getProducts({ page: 1, pageSize: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("updates a product", async () => {
    const updated = { ...mockProduct, name: "Mutton Biryani" };
    m.product.update.mockResolvedValue(updated);
    const result = await productService.updateProduct("prod-1", { name: "Mutton Biryani" }, "user-1");
    expect(result.name).toBe("Mutton Biryani");
  });
});
