import { describe, it, expect } from "vitest";
import {
  calculateSale,
  generateInvoiceNumber,
  formatCurrency,
  isValidQuantity,
  isValidProductId,
} from "./sale.utils";

describe("calculateSale", () => {
  const items = [
    { productId: "p1", productName: "Chicken Biryani", quantity: 2, unitPrice: 350 },
    { productId: "p2", productName: "Mutton Biryani", quantity: 1, unitPrice: 500 },
  ];

  it("calculates subtotal correctly", () => {
    const result = calculateSale(items);
    expect(result.subtotal).toBe(1200);
    expect(result.total).toBe(1200);
    expect(result.discount).toBe(0);
  });

  it("applies discount correctly", () => {
    const result = calculateSale(items, 200);
    expect(result.subtotal).toBe(1200);
    expect(result.discount).toBe(200);
    expect(result.total).toBe(1000);
  });

  it("clamps discount to subtotal", () => {
    const result = calculateSale(items, 5000);
    expect(result.discount).toBe(1200);
    expect(result.total).toBe(0);
  });

  it("handles negative discount", () => {
    const result = calculateSale(items, -100);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(1200);
  });

  it("returns zero for empty cart", () => {
    const result = calculateSale([]);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("ensures quantity is at least 1", () => {
    const result = calculateSale([
      { productId: "p1", productName: "Test", quantity: 0, unitPrice: 100 },
    ]);
    expect(result.items[0].quantity).toBe(1);
    expect(result.subtotal).toBe(100);
  });

  it("floors fractional quantities", () => {
    const result = calculateSale([
      { productId: "p1", productName: "Test", quantity: 2.7, unitPrice: 100 },
    ]);
    expect(result.items[0].quantity).toBe(2);
    expect(result.subtotal).toBe(200);
  });
});

describe("generateInvoiceNumber", () => {
  it("generates correct format", () => {
    const result = generateInvoiceNumber(1);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    expect(result).toBe(`SB-${today}-0001`);
  });

  it("pads counter to 4 digits", () => {
    const result = generateInvoiceNumber(42);
    expect(result).toContain("-0042");
  });
});

describe("formatCurrency", () => {
  it("formats as Rs. with 2 decimals", () => {
    expect(formatCurrency(100)).toBe("Rs. 100.00");
    expect(formatCurrency(1234.5)).toBe("Rs. 1234.50");
  });
});

describe("isValidQuantity", () => {
  it("accepts positive integers", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(100)).toBe(true);
  });

  it("rejects zero and negatives", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-1)).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(isValidQuantity(1.5)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isValidQuantity("1")).toBe(false);
    expect(isValidQuantity(null)).toBe(false);
    expect(isValidQuantity(undefined)).toBe(false);
  });
});

describe("isValidProductId", () => {
  it("accepts non-empty strings", () => {
    expect(isValidProductId("abc-123")).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(isValidProductId("")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidProductId(123)).toBe(false);
    expect(isValidProductId(null)).toBe(false);
  });
});
