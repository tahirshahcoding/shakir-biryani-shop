import { db } from "@/lib/db/prisma";

export async function findMany() {
  const settings = await db.setting.findMany({ orderBy: { key: "asc" } });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function findValue(key: string) {
  const setting = await db.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function findNumber(key: string) {
  const value = await findValue(key);
  if (value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export async function upsertMany(data: Record<string, string>) {
  const updates = Object.entries(data).map(([key, value]) =>
    db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );
  await db.$transaction(updates);
  return findMany();
}
