import { describe, it, expect } from "vitest";
import {
  getInventoryStatus,
  calculateNewStockAfterSale,
  calculateStockAfterAdjustment,
  isLowStock,
  paginate,
} from "./inventory.utils";

describe("getInventoryStatus", () => {
  it("returns OUT_OF_STOCK when quantity is 0", () => {
    expect(getInventoryStatus(0, 10)).toBe("OUT_OF_STOCK");
  });

  it("returns OUT_OF_STOCK when quantity is negative", () => {
    expect(getInventoryStatus(-5, 10)).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when quantity equals minimum", () => {
    expect(getInventoryStatus(10, 10)).toBe("LOW_STOCK");
  });

  it("returns LOW_STOCK when quantity is below minimum", () => {
    expect(getInventoryStatus(5, 10)).toBe("LOW_STOCK");
  });

  it("returns IN_STOCK when quantity is above minimum", () => {
    expect(getInventoryStatus(15, 10)).toBe("IN_STOCK");
  });
});

describe("calculateNewStockAfterSale", () => {
  it("reduces stock correctly", () => {
    const result = calculateNewStockAfterSale(20, 3);
    expect(result.newQuantity).toBe(17);
    expect(result.isNegative).toBe(false);
  });

  it("detects negative stock", () => {
    const result = calculateNewStockAfterSale(2, 5);
    expect(result.newQuantity).toBe(-3);
    expect(result.isNegative).toBe(true);
  });

  it("handles exact stock depletion", () => {
    const result = calculateNewStockAfterSale(10, 10);
    expect(result.newQuantity).toBe(0);
    expect(result.isNegative).toBe(false);
  });
});

describe("calculateStockAfterAdjustment", () => {
  it("increases stock", () => {
    const result = calculateStockAfterAdjustment(10, 5);
    expect(result.newQuantity).toBe(15);
    expect(result.isNegative).toBe(false);
  });

  it("decreases stock", () => {
    const result = calculateStockAfterAdjustment(10, -5);
    expect(result.newQuantity).toBe(5);
    expect(result.isNegative).toBe(false);
  });

  it("detects negative result", () => {
    const result = calculateStockAfterAdjustment(3, -10);
    expect(result.newQuantity).toBe(-7);
    expect(result.isNegative).toBe(true);
  });
});

describe("isLowStock", () => {
  it("returns true when at minimum", () => {
    expect(isLowStock(10, 10)).toBe(true);
  });

  it("returns true when below minimum", () => {
    expect(isLowStock(5, 10)).toBe(true);
  });

  it("returns false when above minimum", () => {
    expect(isLowStock(15, 10)).toBe(false);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 50 }, (_, i) => i + 1);

  it("returns first page correctly", () => {
    const result = paginate(items, 1, 10);
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.total).toBe(50);
    expect(result.totalPages).toBe(5);
    expect(result.page).toBe(1);
  });

  it("returns middle page correctly", () => {
    const result = paginate(items, 3, 10);
    expect(result.items).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  });

  it("returns last page with remaining items", () => {
    const result = paginate(items, 5, 10);
    expect(result.items).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
  });

  it("clamps page to valid range when too high", () => {
    const result = paginate(items, 100, 10);
    expect(result.page).toBe(5);
    expect(result.items).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
  });

  it("clamps page to 1 when too low", () => {
    const result = paginate(items, -5, 10);
    expect(result.page).toBe(1);
  });

  it("handles empty array", () => {
    const result = paginate([], 1, 10);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });

  it("handles single page", () => {
    const result = paginate([1, 2, 3], 1, 10);
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.totalPages).toBe(1);
  });
});
