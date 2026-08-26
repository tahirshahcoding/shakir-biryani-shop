import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDbMock } from "@/lib/db/__mocks/prisma";

vi.mock("@/lib/db/prisma", () => ({ db: createDbMock() }));
vi.mock("@/modules/audit/audit.repository", () => ({ create: vi.fn().mockResolvedValue({ id: "audit-1" }) }));

import { db } from "@/lib/db/prisma";
import * as expenseService from "./expense.service";

const m = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("expense.service integration", () => {
  const mockCategory = { id: "cat-1", name: "Rent", isActive: true, description: null, _count: { expenses: 0 } };
  const mockExpense = {
    id: "exp-1",
    amount: 5000,
    description: "Monthly rent",
    paymentMethod: "CASH",
    expenseDate: new Date("2024-01-15"),
    categoryId: "cat-1",
    createdById: "user-1",
    category: { id: "cat-1", name: "Rent" },
    createdBy: { id: "user-1", name: "Admin" },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("creates expense with valid category", async () => {
    m.expenseCategory.findUnique.mockResolvedValue(mockCategory);
    m.expense.create.mockResolvedValue(mockExpense);
    const result = await expenseService.createExpense({
      categoryId: "cat-1",
      amount: 5000,
      description: "Monthly rent",
      paymentMethod: "CASH",
      expenseDate: "2024-01-15",
      createdById: "user-1",
    });
    expect(result.amount).toBe(5000);
    expect(m.expense.create).toHaveBeenCalledOnce();
  });

  it("rejects expense with invalid category", async () => {
    m.expenseCategory.findUnique.mockResolvedValue(null);
    await expect(
      expenseService.createExpense({
        categoryId: "bad-id",
        amount: 5000,
        createdById: "user-1",
      })
    ).rejects.toThrow("Invalid expense category");
  });

  it("rejects expense with inactive category", async () => {
    m.expenseCategory.findUnique.mockResolvedValue({ ...mockCategory, isActive: false });
    await expect(
      expenseService.createExpense({
        categoryId: "cat-1",
        amount: 5000,
        createdById: "user-1",
      })
    ).rejects.toThrow("Invalid expense category");
  });

  it("deletes an expense", async () => {
    m.expense.delete.mockResolvedValue(mockExpense);
    await expenseService.deleteExpense("exp-1", "user-1");
    expect(m.expense.delete).toHaveBeenCalledWith({ where: { id: "exp-1" } });
  });

  it("lists expenses with pagination", async () => {
    m.expense.findMany.mockResolvedValue([mockExpense]);
    m.expense.count.mockResolvedValue(1);
    const result = await expenseService.getExpenses({ page: 1, pageSize: 25 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
