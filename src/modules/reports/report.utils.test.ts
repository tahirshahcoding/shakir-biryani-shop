import { describe, it, expect } from "vitest";
import { buildDateRangeWhere, getInventoryStatus, aggregateByField } from "./report.utils";

describe("buildDateRangeWhere", () => {
  it("returns undefined when no dates provided", () => {
    expect(buildDateRangeWhere("createdAt", {})).toBeUndefined();
  });

  it("builds start-date-only filter", () => {
    const result = buildDateRangeWhere("createdAt", { startDate: "2024-01-15" });
    expect(result).toEqual({
      createdAt: { gte: new Date("2024-01-15") },
    });
  });

  it("builds end-date-only filter", () => {
    const result = buildDateRangeWhere("createdAt", { endDate: "2024-01-31" });
    expect(result).toEqual({
      createdAt: { lte: new Date("2024-01-31T23:59:59.999Z") },
    });
  });

  it("builds both-start-and-end filter", () => {
    const result = buildDateRangeWhere("expenseDate", {
      startDate: "2024-03-01",
      endDate: "2024-03-31",
    });
    expect(result).toEqual({
      expenseDate: {
        gte: new Date("2024-03-01"),
        lte: new Date("2024-03-31T23:59:59.999Z"),
      },
    });
  });

  it("uses the correct field name", () => {
    const result = buildDateRangeWhere("updatedAt", { startDate: "2024-06-01" });
    expect(result).toHaveProperty("updatedAt");
  });
});

describe("getInventoryStatus (report utils)", () => {
  it("returns OUT_OF_STOCK when quantity is 0", () => {
    expect(getInventoryStatus(0, 10)).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when at minimum", () => {
    expect(getInventoryStatus(5, 5)).toBe("LOW_STOCK");
  });

  it("returns IN_STOCK when above minimum", () => {
    expect(getInventoryStatus(20, 5)).toBe("IN_STOCK");
  });
});

describe("aggregateByField", () => {
  const items = [
    { type: "CASH", total: 100, count: 1 },
    { type: "CASH", total: 200, count: 1 },
    { type: "CARD", total: 150, count: 1 },
  ];

  it("groups and sums correctly", () => {
    const result = aggregateByField(items, "type", "total");
    expect(result).toEqual([
      { key: "CASH", total: 300, count: 2 },
      { key: "CARD", total: 150, count: 1 },
    ]);
  });

  it("handles empty array", () => {
    const result = aggregateByField([], "type", "total");
    expect(result).toEqual([]);
  });

  it("handles non-numeric values gracefully", () => {
    const mixed = [
      { category: "A", amount: 100 },
      { category: "A", amount: "invalid" },
    ] as unknown as { category: string; amount: number }[];
    const result = aggregateByField(mixed, "category", "amount");
    expect(result[0].total).toBe(100);
  });
});
