"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { DateFilter, type DateRange } from "@/components/ui/date-filter";

type SalesReport = {
  totalRevenue: number;
  totalDiscount: number;
  totalSales: number;
  averageSale: number;
  byPaymentMethod: { method: string; total: number; count: number }[];
};

type ExpenseReport = {
  totalExpenses: number;
  count: number;
  byCategory: { categoryId: string; categoryName: string; total: number; count: number }[];
};

type InventoryReport = {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  items: { id: string; name: string; unit: string; currentQuantity: number; minimumQuantity: number; status: string }[];
};

type ProductReport = {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}[];

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"sales" | "expenses" | "inventory" | "products">("sales");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [productData, setProductData] = useState<ProductReport | null>(null);

  const loadReport = (type: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ type });
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);

    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          switch (type) {
            case "sales": setSalesData(res.data); break;
            case "expenses": setExpenseData(res.data); break;
            case "inventory": setInventoryData(res.data); break;
            case "products": setProductData(res.data); break;
          }
        } else {
          setError(res.error || "Failed to load report");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load report");
        setLoading(false);
      });
  };

  useEffect(() => { loadReport(activeTab); }, [activeTab, dateRange]);

  const tabs = [
    { id: "sales" as const, label: "Sales" },
    { id: "expenses" as const, label: "Expenses" },
    { id: "inventory" as const, label: "Inventory" },
    { id: "products" as const, label: "Products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden" role="tablist" aria-label="Report types">
          {tabs.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab !== "inventory" && (
          <DateFilter value={dateRange} onChange={setDateRange} />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => loadReport(activeTab)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><p className="text-gray-500">Loading report...</p></div>
      ) : (
        <div>
          {activeTab === "sales" && salesData && <SalesReportView data={salesData} />}
          {activeTab === "expenses" && expenseData && <ExpenseReportView data={expenseData} />}
          {activeTab === "inventory" && inventoryData && <InventoryReportView data={inventoryData} />}
          {activeTab === "products" && productData && <ProductReportView data={productData} />}
        </div>
      )}
    </div>
  );
}

function SalesReportView({ data }: { data: SalesReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
        <StatCard label="Total Sales" value={data.totalSales} />
        <StatCard label="Average Sale" value={formatCurrency(Math.round(data.averageSale))} />
        <StatCard label="Total Discount" value={formatCurrency(data.totalDiscount)} />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">By Payment Method</h3>
        {data.byPaymentMethod.length === 0 ? <p className="text-gray-500 text-sm">No data for this period</p> : (
          <div className="space-y-3 sm:space-y-0">
            {data.byPaymentMethod.map((r) => (
              <div key={r.method} className="flex justify-between items-center py-2 sm:py-0 sm:border-b sm:border-gray-100">
                <span className="text-sm font-medium">{r.method}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">{r.count} sales</span>
                  <span className="font-medium">{formatCurrency(r.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseReportView({ data }: { data: ExpenseReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Expenses" value={formatCurrency(data.totalExpenses)} />
        <StatCard label="Expense Count" value={data.count} />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
        {data.byCategory.length === 0 ? <p className="text-gray-500 text-sm">No data for this period</p> : (
          <div className="space-y-3 sm:space-y-0">
            {data.byCategory.map((r) => (
              <div key={r.categoryId} className="flex justify-between items-center py-2 sm:py-0 sm:border-b sm:border-gray-100">
                <span className="text-sm font-medium">{r.categoryName}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">{r.count} items</span>
                  <span className="font-medium">{formatCurrency(r.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryReportView({ data }: { data: InventoryReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Items" value={data.totalItems} />
        <StatCard label="Low Stock" value={data.lowStockCount} />
        <StatCard label="Out of Stock" value={data.outOfStockCount} />
      </div>
      {data.items.length === 0 ? (
        <EmptyState title="No inventory data" message="Add inventory items to see reports" />
      ) : (
        <div className="space-y-3 sm:space-y-0 sm:bg-white sm:rounded-lg sm:border sm:border-gray-200 sm:overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 sm:bg-gray-50 sm:px-4 sm:py-3">
            <span className="text-xs font-medium text-gray-500 uppercase">Item</span>
            <span className="text-xs font-medium text-gray-500 uppercase text-right">Current</span>
            <span className="text-xs font-medium text-gray-500 uppercase text-right">Minimum</span>
            <span className="text-xs font-medium text-gray-500 uppercase text-center">Status</span>
          </div>
          {data.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center sm:border-0 sm:rounded-none sm:border-b sm:last:border-b-0">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-right">{item.currentQuantity} {item.unit}</span>
              <span className="text-sm text-right text-gray-500">{item.minimumQuantity} {item.unit}</span>
              <span className="text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-800" : item.status === "LOW_STOCK" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                  {item.status.replace("_", " ")}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductReportView({ data }: { data: ProductReport }) {
  if (data.length === 0) return <EmptyState title="No product data" message="Complete sales to see product performance" />;
  return (
    <div className="space-y-3 sm:space-y-0 sm:bg-white sm:rounded-lg sm:border sm:border-gray-200 sm:overflow-hidden">
      <div className="hidden sm:grid sm:grid-cols-5 sm:gap-4 sm:bg-gray-50 sm:px-4 sm:py-3">
        <span className="text-xs font-medium text-gray-500 uppercase">Product</span>
        <span className="text-xs font-medium text-gray-500 uppercase text-right">Qty Sold</span>
        <span className="text-xs font-medium text-gray-500 uppercase text-right">Revenue</span>
        <span className="text-xs font-medium text-gray-500 uppercase text-right">Cost</span>
        <span className="text-xs font-medium text-gray-500 uppercase text-right">Profit</span>
      </div>
      {data.map((p) => (
        <div key={p.productId} className="bg-white border border-gray-200 rounded-lg p-3 sm:grid sm:grid-cols-5 sm:gap-4 sm:items-center sm:border-0 sm:rounded-none sm:border-b sm:last:border-b-0">
          <span className="text-sm font-medium">{p.name}</span>
          <span className="text-sm text-right">{p.totalQuantity}</span>
          <span className="text-sm text-right">{formatCurrency(p.totalRevenue)}</span>
          <span className="text-sm text-right text-gray-600">{formatCurrency(Math.round(p.totalCost))}</span>
          <span className={`text-sm text-right font-medium ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(Math.round(p.profit))}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
