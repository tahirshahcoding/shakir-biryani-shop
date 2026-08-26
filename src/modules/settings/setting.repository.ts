import { db } from "@/lib/db/prisma";

export async function findMany() {
  const settings = await db.setting.findMany({ orderBy: { key: "asc" } });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function upsertMany(data: Record<string, string>) {
  const updates = Object.entries(data).map(([key, value]) =>
    db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );
  await Promise.all(updates);
  return findMany();
}
