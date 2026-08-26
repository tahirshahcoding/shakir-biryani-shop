export type DateRangeFilter = {
  startDate?: string;
  endDate?: string;
};

export function buildDateRangeWhere(
  field: string,
  filters: DateRangeFilter
): Record<string, unknown> | undefined {
  const { startDate, endDate } = filters;
  if (!startDate && !endDate) return undefined;

  const condition: Record<string, Date> = {};
  if (startDate) condition.gte = new Date(startDate);
  if (endDate) condition.lte = new Date(endDate + "T23:59:59.999Z");

  return { [field]: condition };
}

export function getInventoryStatus(
  currentQuantity: number,
  minimumQuantity: number
): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (currentQuantity <= 0) return "OUT_OF_STOCK";
  if (currentQuantity <= minimumQuantity) return "LOW_STOCK";
  return "IN_STOCK";
}

export function aggregateByField<T extends Record<string, unknown>>(
  items: T[],
  groupField: keyof T,
  sumField: keyof T
): { key: unknown; total: number; count: number }[] {
  const map = new Map<unknown, { total: number; count: number }>();

  for (const item of items) {
    const key = item[groupField];
    const value = Number(item[sumField]) || 0;
    const existing = map.get(key) || { total: 0, count: 0 };
    existing.total += value;
    existing.count += 1;
    map.set(key, existing);
  }

  return Array.from(map.entries()).map(([key, { total, count }]) => ({ key, total, count }));
}
