"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { useModal } from "@/hooks/use-modal";
import { History, Trash2 } from "lucide-react";

type InventoryItem = { id: string; name: string; unit: string; currentQuantity: number; minimumQuantity: number; isActive: boolean };
type Transaction = { id: string; type: string; quantity: number; previousQuantity: number; newQuantity: number; reason: string | null; createdAt: string; createdBy: { name: string } };

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  // Adjust Stock modal
  const [showAdjust, setShowAdjust] = useState(false);
  const adjustModal = useModal(showAdjust, () => setShowAdjust(false));

  // History modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const historyModal = useModal(!!selectedItem, () => setSelectedItem(null));

  // Add Item modal
  const [showAddItem, setShowAddItem] = useState(false);
  const addItemModal = useModal(showAddItem, () => setShowAddItem(false));

  const loadItems = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (showLowStock) params.set("isLowStock", "true");
    fetch(`/api/inventory?${params}`).then((r) => r.json()).then((res) => {
      setItems(res.data?.items || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load inventory");
      setLoading(false);
    });
  };

  useEffect(() => { loadItems(); }, [search, showLowStock]);

  const viewTransactions = (item: InventoryItem) => {
    setSelectedItem(item);
    fetch(`/api/inventory/${item.id}/transactions?pageSize=50`).then((r) => r.json()).then((res) => setTransactions(res.data?.items || []));
  };

  const handleAdjustSubmit = async (itemId: string, action: "stock-in" | "adjust", quantity: number, reason: string) => {
    const body = action === "stock-in"
      ? { action: "stock-in", inventoryItemId: itemId, quantity, reason }
      : { action: "adjust", inventoryItemId: itemId, newQuantity: quantity, reason };
    const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast(action === "stock-in" ? "Stock added" : "Stock adjusted"); setShowAdjust(false); loadItems(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleAddItem = async (data: { name: string; unit: string; minimumQuantity: number }) => {
    const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { toast("Item created"); setShowAddItem(false); loadItems(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Item deleted"); loadItems(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Inventory</h1><TableSkeleton rows={5} cols={5} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadItems} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." aria-label="Search inventory" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-auto" />
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showLowStock} onChange={(e) => setShowLowStock(e.target.checked)} className="rounded" />
            Low Stock
          </label>
          <button onClick={() => setShowAdjust(true)} className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 whitespace-nowrap">Adjust Stock</button>
          <button onClick={() => setShowAddItem(true)} className="px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 whitespace-nowrap">+ Add</button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No inventory items" message="Add your first inventory item" action={<button onClick={() => setShowAddItem(true)} className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">Add Item</button>} />
      ) : (
        <>
          <MobileCardGrid>
            {items.map((item) => {
              const isLow = item.currentQuantity <= item.minimumQuantity;
              return (
                <MobileCard key={item.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                    <span className={`ml-2 flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      {isLow ? "Low" : "OK"}
                    </span>
                  </div>
                  <MobileCardRow label="Stock" value={`${item.currentQuantity} ${item.unit}`} />
                  <MobileCardRow label="Min" value={`${item.minimumQuantity} ${item.unit}`} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => viewTransactions(item)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="History"><History className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </MobileCard>
              );
            })}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const isLow = item.currentQuantity <= item.minimumQuantity;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.currentQuantity} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{item.minimumQuantity} {item.unit}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{isLow ? "Low Stock" : "OK"}</span>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button onClick={() => viewTransactions(item)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="History"><History className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DesktopTable>
        </>
      )}

      {/* History Modal */}
      {selectedItem && (
        <div ref={historyModal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Transaction history" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
              <h2 className="text-lg font-bold truncate">{selectedItem.name} - History</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 ml-2" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3 sm:space-y-0">
                  {transactions.map((t) => (
                    <div key={t.id} className="sm:flex sm:items-center sm:justify-between py-2 sm:py-0 sm:border-b sm:border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${t.type === "STOCK_IN" ? "bg-green-100 text-green-800" : t.type === "ADJUSTMENT" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{t.type}</span>
                        <span className="text-sm text-gray-600">{t.reason || "-"}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 sm:mt-0 text-sm">
                        <span className="text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span className="font-medium">{t.previousQuantity} → {t.newQuantity}</span>
                        <span className="text-gray-500">{t.createdBy.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjust && <AdjustStockModal items={items} onSubmit={handleAdjustSubmit} onClose={() => setShowAdjust(false)} modalRef={adjustModal.overlayRef} />}

      {/* Add Item Modal */}
      {showAddItem && <AddItemModal onSubmit={handleAddItem} onClose={() => setShowAddItem(false)} modalRef={addItemModal.overlayRef} />}
    </div>
  );
}

function AdjustStockModal({ items, onSubmit, onClose, modalRef }: { items: InventoryItem[]; onSubmit: (itemId: string, action: "stock-in" | "adjust", quantity: number, reason: string) => void; onClose: () => void; modalRef: React.RefObject<HTMLDivElement | null> }) {
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState<"stock-in" | "adjust">("stock-in");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((i) => i.id === selectedId);

  useEffect(() => {
    if (selectedId && inputRef.current) inputRef.current.focus();
  }, [selectedId, action]);

  const handleSubmit = () => {
    if (!selectedId || !qty || !reason) return;
    const quantity = action === "stock-in" ? Number(qty) : Number(qty);
    onSubmit(selectedId, action, quantity, reason);
  };

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Adjust stock" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Adjust Stock</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="inv-select" className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
            <select id="inv-select" value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setQty(""); setReason(""); }} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choose an item...</option>
              {items.filter((i) => i.isActive).map((item) => (
                <option key={item.id} value={item.id}>{item.name} ({item.currentQuantity} {item.unit})</option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <div className="flex gap-2">
                  <button onClick={() => setAction("stock-in")} className={`flex-1 py-2 rounded-md text-sm font-medium border ${action === "stock-in" ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>+ Stock In</button>
                  <button onClick={() => setAction("adjust")} className={`flex-1 py-2 rounded-md text-sm font-medium border ${action === "adjust" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Set Quantity</button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
                Current: <span className="font-medium">{selectedItem.currentQuantity} {selectedItem.unit}</span>
                {action === "stock-in" && qty && <span className="ml-2">→ <span className="font-medium text-green-600">{selectedItem.currentQuantity + Number(qty)} {selectedItem.unit}</span></span>}
                {action === "adjust" && qty && <span className="ml-2">→ <span className="font-medium text-blue-600">{qty} {selectedItem.unit}</span></span>}
              </div>

              <div>
                <label htmlFor="inv-qty" className="block text-sm font-medium text-gray-700 mb-1">{action === "stock-in" ? "Quantity to Add" : "New Quantity"}</label>
                <input ref={inputRef} id="inv-qty" type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={action === "stock-in" ? "How much to add?" : "Set to what?"} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label htmlFor="inv-reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input id="inv-reason" type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Purchase delivery, Physical count" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={!selectedId || !qty || !reason} className="flex-1 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {action === "stock-in" ? "Add Stock" : "Adjust"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onSubmit, onClose, modalRef }: { onSubmit: (data: { name: string; unit: string; minimumQuantity: number }) => void; onClose: () => void; modalRef: React.RefObject<HTMLDivElement | null> }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minQty, setMinQty] = useState("1");
  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Add inventory item" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Add Inventory Item</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input id="add-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Basmati Rice" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label htmlFor="add-unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select id="add-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="kg">kg</option><option value="g">g</option><option value="liters">liters</option><option value="ml">ml</option><option value="piece">piece</option>
            </select>
          </div>
          <div>
            <label htmlFor="add-min" className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
            <input id="add-min" type="number" min="0" value={minQty} onChange={(e) => setMinQty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={() => name && onSubmit({ name, unit, minimumQuantity: Number(minQty) })} className="flex-1 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
