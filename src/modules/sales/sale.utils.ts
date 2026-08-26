export type SaleItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type SaleCalculation = {
  items: SaleItemInput[];
  subtotal: number;
  discount: number;
  total: number;
};

export function calculateSale(
  items: { productId: string; quantity: number; unitPrice: number; productName: string }[],
  discount: number = 0
): SaleCalculation {
  if (items.length === 0) {
    return { items: [], subtotal: 0, discount: 0, total: 0 };
  }

  let subtotal = 0;
  const saleItems: SaleItemInput[] = items.map((item) => {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Math.max(0, item.unitPrice);
    const itemSubtotal = unitPrice * quantity;
    subtotal += itemSubtotal;

    return {
      productId: item.productId,
      productName: item.productName,
      quantity,
      unitPrice,
    };
  });

  const validDiscount = Math.max(0, Math.min(discount, subtotal));
  const total = Math.max(0, subtotal - validDiscount);

  return { items: saleItems, subtotal, discount: validDiscount, total };
}

export function generateInvoiceNumber(counter: number): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `SB-${date}-${String(counter).padStart(4, "0")}`;
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export function isValidQuantity(quantity: unknown): quantity is number {
  return typeof quantity === "number" && Number.isInteger(quantity) && quantity >= 1;
}

export function isValidProductId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0;
}
