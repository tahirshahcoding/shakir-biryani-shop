"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  description: string | null;
  sellingPrice: number;
  category: { id: string; name: string };
};

type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type CompletedSale = {
  invoiceNumber: string;
  total: number;
  discount: number;
  paymentMethod: string;
  items: { productName: string; quantity: number; subtotal: number }[];
};

export default function POSPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/products?all=true").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load products");
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter((p) => {
    if (selectedCategory && p.category.id !== selectedCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [products, selectedCategory, search]);

  const { subtotal, discountAmount, total, cartCount } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const disc = Math.min(discount, sub);
    const tot = Math.max(0, sub - disc);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, discountAmount: disc, total: tot, cartCount: count };
  }, [cart, discount]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: Number(product.sellingPrice) }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  async function handleCheckout() {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          discount: discountAmount > 0 ? discountAmount : undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Failed to complete sale", "error");
        return;
      }

      setCompletedSale({
        invoiceNumber: data.data.invoiceNumber,
        total: data.data.total,
        discount: data.data.discount,
        paymentMethod: data.data.paymentMethod,
        items: data.data.items,
      });
      setCart([]);
      setDiscount(0);
      setPaymentMethod("CASH");
      setCartOpen(false);
    } catch {
      toast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function newSale() {
    setCompletedSale(null);
    searchRef.current?.focus();
  }

  // ─── Completed sale screen ───
  if (completedSale) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sale Complete!</h2>
          <p className="text-sm text-gray-500 mb-6 font-mono">{completedSale.invoiceNumber}</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {completedSale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.productName} x{item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            {completedSale.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 border-t border-gray-200 pt-2">
                <span>Discount</span>
                <span>-{formatCurrency(completedSale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(completedSale.total)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">Paid via {completedSale.paymentMethod}</p>

          <button onClick={newSale} className="w-full py-3.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors text-base">
            New Sale
          </button>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="relative -m-4 sm:-m-6 lg:-m-8 min-h-screen bg-gray-50">
        {/* Search bar skeleton */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
        {/* Category pills skeleton */}
        <div className="sticky top-[60px] z-20 bg-white border-b border-gray-200 px-4 py-2.5">
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-full shrink-0" style={{ width: i === 1 ? 60 : 80 + (i % 3) * 20 }} />
            ))}
          </div>
        </div>
        {/* Product grid skeleton */}
        <div className="px-4 py-3 pb-28">
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main POS ───
  return (
    <div className="relative -m-4 sm:-m-6 lg:-m-8 min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Top bar: Search + Cart button ─── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search biryani..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2.5 bg-orange-600 text-white rounded-xl active:bg-orange-700 transition-colors shrink-0"
          aria-label={`Open cart, ${cartCount} items`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Category pills ─── */}
      <div className="sticky top-[60px] z-20 bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Product grid ─── */}
      <div className="flex-1 px-4 py-3 pb-28">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product) => {
              const inCart = cart.find((c) => c.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`relative bg-white rounded-xl p-3.5 text-left transition-all active:scale-[0.97] ${
                    inCart
                      ? "ring-2 ring-orange-500 shadow-sm"
                      : "border border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-1.5 truncate">{product.category.name}</p>
                  <p className="text-base font-bold text-orange-600 mt-2">{formatCurrency(product.sellingPrice)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Floating cart bar ─── */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-orange-600 text-white py-4 px-5 rounded-2xl font-bold text-base flex items-center justify-between shadow-xl shadow-orange-600/30 active:bg-orange-700 transition-colors pointer-events-auto"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </button>
        </div>
      )}

      {/* ─── Cart bottom drawer ─── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setCartOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Cart header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="w-12 h-12 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Tap a product to add it</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
                        aria-label={`Decrease ${item.productName}`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 active:bg-orange-200 flex items-center justify-center text-lg font-bold transition-colors"
                        aria-label={`Increase ${item.productName}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900 w-16 text-right tabular-nums">{formatCurrency(item.quantity * item.unitPrice)}</p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 active:bg-red-50 transition-colors"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer — always visible when cart is open */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-200 space-y-3 bg-white">
                {/* Discount */}
                <div className="flex items-center gap-3">
                  <label htmlFor="pos-discount" className="text-sm text-gray-500 shrink-0">Discount (optional)</label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                    <input
                      id="pos-discount"
                      type="number"
                      min="0"
                      max={subtotal}
                      value={discount || ""}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 tabular-nums"
                    />
                  </div>
                </div>

                {/* Payment method pills */}
                <div className="flex gap-2">
                  {(["CASH", "CARD", "ONLINE", "OTHER"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        paymentMethod === method
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-500 active:bg-gray-200"
                      }`}
                    >
                      {method === "CASH" ? "Cash" : method === "CARD" ? "Card" : method === "ONLINE" ? "Online" : "Other"}
                    </button>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1">
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-2xl font-bold text-orange-600 tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout button — BIG and obvious */}
                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg shadow-lg shadow-orange-600/20"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatCurrency(total)}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
