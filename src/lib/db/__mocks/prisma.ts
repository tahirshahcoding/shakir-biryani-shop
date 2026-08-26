import { vi } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;

function createModelMock() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: {}, _count: 0 }),
    groupBy: vi.fn().mockResolvedValue([]),
  };
}

export function createDbMock() {
  return {
    product: createModelMock(),
    category: createModelMock(),
    sale: createModelMock(),
    saleItem: createModelMock(),
    expense: createModelMock(),
    expenseCategory: createModelMock(),
    inventoryItem: createModelMock(),
    inventoryTransaction: createModelMock(),
    user: createModelMock(),
    role: createModelMock(),
    auditLog: createModelMock(),
    payment: createModelMock(),
    setting: createModelMock(),
    $transaction: vi.fn(async (fn: (tx: ReturnType<typeof createDbMock>) => Promise<unknown>) => {
      const tx = createDbMock();
      return fn(tx);
    }),
    $executeRaw: vi.fn().mockResolvedValue(0),
    $queryRaw: vi.fn().mockResolvedValue([]),
  };
}

export type DbMock = ReturnType<typeof createDbMock>;

let dbMock: DbMock;

export function setupDbMock() {
  dbMock = createDbMock();
  vi.doMock("@/lib/db/prisma", () => ({ db: dbMock }));
  vi.doMock("@/modules/audit/audit.repository", () => ({
    create: vi.fn().mockResolvedValue({}),
  }));
  return dbMock;
}

export function getDbMock() {
  return dbMock;
}
