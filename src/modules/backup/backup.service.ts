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

export async function createBackup(): Promise<BackupData> {
  const tables: Record<string, unknown[]> = {};
  for (const model of TABLE_ORDER) {
    const delegate = (db as unknown as Record<ModelKey, { findMany: () => Promise<unknown[]> }>)[model];
    tables[model] = await delegate.findMany();
  }
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