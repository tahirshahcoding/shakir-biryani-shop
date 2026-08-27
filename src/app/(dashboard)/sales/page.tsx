"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { formatCurrency, formatDate } from "@/lib/format";
import { useModal } from "@/hooks/use-modal";
import { DateFilter, type DateRange } from "@/components/ui/date-filter";

type SaleItem = { id: string; productName: string; quantity: number; unitPrice: number; subtotal: number };
type Sale = { id: string; invoiceNumber: string; subtotal: number; discount: number; total: number; status: string; paymentMethod: string; createdAt: string; createdBy: { name: string }; items: SaleItem[] };

export default function SalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const saleModal = useModal(!!selectedSale, () => setSelectedSale(null));

  const loadSales = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (search) params.set("search", search);
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    fetch(`/api/sales?${params}`, { cache: "no-store" }).then((r) => r.json()).then((res) => {
      setSales(res.data?.items || []);
      setTotal(res.data?.total || 0);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load sales");
      setLoading(false);
    });
  }, [page, search, dateRange]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const handleVoid = async (id: string) => {
    if (!confirm("Are you sure you want to void this sale? This cannot be undone.")) return;
    const res = await fetch(`/api/sales/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "void" }) });
    if (res.ok) { toast("Sale voided"); setSelectedSale(null); loadSales(); }
    else { const d = await res.json(); toast(d.error || "Failed to void", "error"); }
  };

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Sales</h1><TableSkeleton rows={8} cols={6} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Sales</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadSales} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice..." aria-label="Search invoices" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-48" />
      </div>

      <div className="mb-4">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {sales.length === 0 ? (
        <EmptyState title="No sales" message="Sales will appear here after completing a POS transaction" />
      ) : (
        <>
          <MobileCardGrid>
            {sales.map((sale) => (
              <MobileCard key={sale.id} onClick={() => setSelectedSale(sale)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sale.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{sale.status}</span>
                </div>
                <MobileCardRow label="Date" value={formatDate(sale.createdAt)} />
                <MobileCardRow label="Cashier" value={sale.createdBy.name} />
                <MobileCardRow label="Total" value={<span className="text-orange-600">{formatCurrency(sale.total)}</span>} />
              </MobileCard>
            ))}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.createdBy.name}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sale.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{sale.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedSale(sale)} className="text-orange-600 hover:text-orange-800 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">Total: {total} sales</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <span className="px-3 py-1.5 text-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={sales.length < 15} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </>
      )}

      {selectedSale && (
        <div ref={saleModal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Sale details" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold">{selectedSale.invoiceNumber}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedSale.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {selectedSale.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productName} x {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1 mb-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(selectedSale.subtotal)}</span></div>
              {selectedSale.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatCurrency(selectedSale.discount)}</span></div>}
              <div className="flex justify-between font-bold"><span>Total</span><span className="text-orange-600">{formatCurrency(selectedSale.total)}</span></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span>Cashier: {selectedSale.createdBy.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedSale.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{selectedSale.status}</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">Paid via {selectedSale.paymentMethod}</div>
            {selectedSale.status === "COMPLETED" && (
              <button onClick={() => handleVoid(selectedSale.id)} className="w-full py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors">
                Void Sale
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
