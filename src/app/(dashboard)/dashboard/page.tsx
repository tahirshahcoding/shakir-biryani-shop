"use client";

import { useEffect, useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";
import { 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  Activity,
  PackageX,
  History,
  AlertCircle
} from "lucide-react";

type DashboardData = {
  todaySales: number;
  todayRevenue: number;
  todayExpenses: number;
  profit: number;
  totalProducts: number;
  lowStockItems: { name: string; currentQuantity: number; minimumQuantity: number; unit: string }[];
  topProducts: { productId: string; productName: string; totalQuantity: number; totalRevenue: number }[];
  recentSales: { id: string; invoiceNumber: string; total: number; status: string; createdAt: string; createdBy: { name: string } }[];
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-7 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>)}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>)}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10));

  const { data, error, isLoading, mutate } = useApi<DashboardData>("/api/dashboard", {
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  // Re-fetch when the day changes at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        mutate();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [mutate]);

  if (isLoading && !data) return <DashboardSkeleton />;

  if (error && !data) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-6 max-w-md">{error instanceof Error ? error.message : "Failed to load dashboard"}</p>
        <button onClick={() => mutate()} className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here is what is happening at your shop today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Todays Orders" 
          value={data?.todaySales || 0} 
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard 
          label="Revenue" 
          value={formatCurrency(data?.todayRevenue || 0)} 
          icon={<Wallet className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <StatCard 
          label="Expenses" 
          value={formatCurrency(data?.todayExpenses || 0)} 
          icon={<TrendingUp className="h-6 w-6 text-orange-600 transform rotate-180" />}
          iconBg="bg-orange-100"
        />
        <StatCard 
          label="Est. Profit" 
          value={formatCurrency(data?.profit || 0)} 
          icon={<Activity className={`h-6 w-6 ${(data?.profit || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`} />}
          iconBg={(data?.profit || 0) >= 0 ? 'bg-purple-100' : 'bg-red-100'}
          valueClass={(data?.profit || 0) >= 0 ? "text-gray-900" : "text-red-600"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              Top Selling Products
            </h2>
          </div>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.topProducts.map((p) => (
                <div key={p.productId} className="flex justify-between items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.totalQuantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No product data yet</p>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PackageX className="h-4 w-4 text-orange-500" />
              Low Stock Items
            </h2>
            {data?.lowStockItems && data.lowStockItems.length > 0 && (
               <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                 {data.lowStockItems.length} items
               </span>
            )}
          </div>
          {data?.lowStockItems && data.lowStockItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{item.currentQuantity}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">{item.minimumQuantity} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="bg-green-50 rounded-full p-3 mb-3">
                <PackageX className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-gray-500 text-sm">All stock levels healthy</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="h-4 w-4 text-gray-500" />
            Recent Sales
          </h2>
        </div>
        {data?.recentSales && data.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{sale.createdBy.name}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        sale.status === "COMPLETED" 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50" 
                          : "bg-red-100 text-red-800 border border-red-200/50"
                      }`}>
                        {sale.status === "COMPLETED" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                        {sale.status !== "COMPLETED" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="bg-gray-100 rounded-full p-3 mb-3">
              <History className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No recent sales</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon,
  iconBg,
  valueClass = "text-gray-900" 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  iconBg: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className={`${iconBg} p-3 rounded-full flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
