import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDbMock } from "@/lib/db/__mocks/prisma";

vi.mock("@/lib/db/prisma", () => ({ db: createDbMock() }));
vi.mock("@/modules/audit/audit.repository", () => ({ create: vi.fn().mockResolvedValue({ id: "audit-1" }) }));

import { db } from "@/lib/db/prisma";
import * as inventoryService from "./inventory.service";

const m = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

beforeEach(() => {
  vi.resetAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (m as any).$transaction.mockImplementation(async (fn: unknown) => {
    return (fn as (tx: typeof db) => Promise<unknown>)(db);
  });
  (m as any).$executeRaw.mockResolvedValue(0);
});

describe("inventory.service integration", () => {
  const mockItem = {
    id: "inv-1",
    name: "Basmati Rice",
    unit: "kg",
    currentQuantity: 100,
    minimumQuantity: 20,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("addStock", () => {
    it("increases stock and creates transaction record", async () => {
      m.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItem)
        .mockResolvedValueOnce({ ...mockItem, currentQuantity: 150 });
      m.inventoryTransaction.create.mockResolvedValue({ id: "txn-1", type: "STOCK_IN" });
      m.auditLog.create.mockResolvedValue({});

      await inventoryService.addStock("inv-1", 50, "Purchase delivery", "user-1");

      expect(m.inventoryItem.findUnique).toHaveBeenCalledWith({ where: { id: "inv-1" } });
      expect((m as any).$executeRaw).toHaveBeenCalled();
      expect(m.inventoryTransaction.create).toHaveBeenCalledOnce();
    });

    it("throws when item not found", async () => {
      m.inventoryItem.findUnique.mockResolvedValue(null);
      await expect(inventoryService.addStock("nonexistent", 50, "reason", "user-1")).rejects.toThrow("Inventory item not found");
    });
  });

  describe("adjustStock", () => {
    it("sets new quantity and creates adjustment record", async () => {
      m.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItem)
        .mockResolvedValueOnce({ ...mockItem, currentQuantity: 80 });
      m.inventoryTransaction.create.mockResolvedValue({ id: "txn-2", type: "ADJUSTMENT" });
      m.auditLog.create.mockResolvedValue({});

      await inventoryService.adjustStock("inv-1", 80, "Physical count correction", "user-1");

      expect((m as any).$executeRaw).toHaveBeenCalled();
      expect(m.inventoryTransaction.create).toHaveBeenCalledOnce();
    });

    it("throws when item not found", async () => {
      m.inventoryItem.findUnique.mockResolvedValue(null);
      await expect(inventoryService.adjustStock("nonexistent", 0, "reason", "user-1")).rejects.toThrow("Inventory item not found");
    });
  });

  describe("restoreStock", () => {
    it("increases stock on restore", async () => {
      m.inventoryItem.findUnique.mockResolvedValue(mockItem);
      m.inventoryItem.update.mockResolvedValue({});
      m.inventoryTransaction.create.mockResolvedValue({});

      await inventoryService.restoreStock(db as never, "inv-1", 3, "Sale void reversal", "user-1");

      expect(m.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { currentQuantity: 103 },
      });
    });

    it("silently returns when item not found", async () => {
      m.inventoryItem.findUnique.mockResolvedValue(null);
      await inventoryService.restoreStock(db as never, "nonexistent", 5, "reason", "user-1");
      expect(m.inventoryItem.update).not.toHaveBeenCalled();
    });
  });
});
