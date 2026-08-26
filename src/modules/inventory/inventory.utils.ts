export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function getInventoryStatus(currentQuantity: number, minimumQuantity: number): InventoryStatus {
  if (currentQuantity <= 0) return "OUT_OF_STOCK";
  if (currentQuantity <= minimumQuantity) return "LOW_STOCK";
  return "IN_STOCK";
}

export function calculateNewStockAfterSale(
  currentQuantity: number,
  soldQuantity: number
): { newQuantity: number; isNegative: boolean } {
  const newQuantity = currentQuantity - soldQuantity;
  return { newQuantity, isNegative: newQuantity < 0 };
}

export function calculateStockAfterAdjustment(
  currentQuantity: number,
  adjustmentDelta: number
): { newQuantity: number; isNegative: boolean } {
  const newQuantity = currentQuantity + adjustmentDelta;
  return { newQuantity, isNegative: newQuantity < 0 };
}

export function isLowStock(currentQuantity: number, minimumQuantity: number): boolean {
  return currentQuantity <= minimumQuantity;
}

export function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
  const items_page = items.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  return { items: items_page, total, page: clampedPage, pageSize, totalPages };
}
