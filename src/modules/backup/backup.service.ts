import { db } from "@/lib/db/prisma";

export type BackupData = {
  version: 1;
  exportedAt: string;
  tables: Record<string, unknown[]>;
};

// Model names in dependency order: parents before children so FKs are valid
// when inserting, and the reverse order is used when deleting.
const TABLE_ORDER = [
  "permission",
  "role",
  "rolePermission",
  "user",
  "category",
  "product",
  "expenseCategory",
  "inventoryItem",
  "setting",
  "sale",
  "saleItem",
  "payment",
  "inventoryTransaction",
  "expense",
  "auditLog",
] as const;

type ModelKey = (typeof TABLE_ORDER)[number];

// Large, ever-growing tables are capped to keep backups fast. The newest
// rows are always included; older rows are pruned.
const ROW_CAPS: Partial<Record<ModelKey, number>> = {
  auditLog: 5000,
  saleItem: 20000,
  inventoryTransaction: 20000,
  expense: 10000,
};

export async function createBackup(): Promise<BackupData> {
  const tables: Record<string, unknown[]> = {};
  await Promise.all(
    TABLE_ORDER.map(async (model) => {
      const cap = ROW_CAPS[model];
      const delegate = (db as unknown as Record<ModelKey, { findMany: (args: unknown) => Promise<unknown[]> }>)[model];
      const args = cap
        ? { orderBy: { createdAt: "desc" as const }, take: cap }
        : undefined;
      tables[model] = await delegate.findMany(args);
    })
  );
  return { version: 1, exportedAt: new Date().toISOString(), tables };
}

export function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== "object") return false;
  const backup = data as Partial<BackupData>;
  if (backup.version !== 1) return false;
  if (typeof backup.exportedAt !== "string" || !backup.tables || typeof backup.tables !== "object") return false;
  return TABLE_ORDER.every((model) => Array.isArray(backup.tables?.[model]));
}

export async function restoreBackup(data: BackupData): Promise<void> {
  await db.$transaction(async (tx) => {
    const delegate = tx as unknown as Record<
      ModelKey,
      { deleteMany: () => Promise<unknown>; createMany: (args: { data: unknown[] }) => Promise<unknown> }
    >;

    for (const model of [...TABLE_ORDER].reverse()) {
      await delegate[model].deleteMany();
    }

    for (const model of TABLE_ORDER) {
      const rows = data.tables[model];
      if (rows.length > 0) {
        await delegate[model].createMany({ data: rows });
      }
    }
  });
}