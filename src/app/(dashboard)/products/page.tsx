"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { useModal } from "@/hooks/use-modal";
import { Pencil, Trash2 } from "lucide-react";

type Category = { id: string; name: string };
type Product = { id: string; name: string; description: string | null; sellingPrice: number; costPrice: number | null; unit: string | null; trackStock: boolean; isAvailable: boolean; isActive: boolean; category: Category };

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", categoryId: "", sellingPrice: "", costPrice: "", unit: "", trackStock: true });
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const modal = useModal(showModal, () => setShowModal(false));

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/products?pageSize=100&search=${search}`).then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.data?.items || []);
      setCategories(c.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load products");
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", categoryId: categories[0]?.id || "", sellingPrice: "", costPrice: "", unit: "pcs", trackStock: true }); setShowModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, description: p.description || "", categoryId: p.category.id, sellingPrice: String(p.sellingPrice), costPrice: p.costPrice ? String(p.costPrice) : "", unit: p.unit || "", trackStock: p.trackStock }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.sellingPrice) { toast("Name, category, and price required", "error"); return; }
    setSaving(true);
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const body = { name: form.name, description: form.description || null, categoryId: form.categoryId, sellingPrice: parseFloat(form.sellingPrice), costPrice: form.costPrice ? parseFloat(form.costPrice) : null, unit: form.unit || null, trackStock: form.trackStock };
    const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { toast(editing ? "Product updated" : "Product created"); setShowModal(false); load(); }
    else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Product deleted"); load(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleAddCategory = async () => {
    if (!catName.trim()) { toast("Category name required", "error"); return; }
    setCatSaving(true);
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName.trim() }) });
    setCatSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast("Category added");
      setCatName("");
      setShowCatModal(false);
      setCategories((prev) => [...prev, data.data]);
      setForm((f) => ({ ...f, categoryId: data.data.id }));
    } else {
      const d = await res.json();
      toast(d.error || "Failed", "error");
    }
  };

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Products</h1><TableSkeleton rows={5} cols={5} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Products</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." aria-label="Search products" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-48" />
          <button onClick={() => setShowCatModal(true)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap">+ Category</button>
          <button onClick={openAdd} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap">+ Product</button>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products" message="Add your first product to get started" action={<button onClick={openAdd} className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">Add Product</button>} />
      ) : (
        <>
          <MobileCardGrid>
            {products.map((p) => (
              <MobileCard key={p.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{p.name}</h3>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.trackStock ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                      {p.trackStock ? "Stock" : "Unlimited"}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.isAvailable && p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {p.isAvailable && p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <MobileCardRow label="Category" value={p.category.name} />
                <MobileCardRow label="Price" value={<span className="text-orange-600">Rs. {p.sellingPrice}</span>} />
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(p)} className="flex flex-1 justify-center items-center py-1.5 text-blue-600 border border-blue-200 rounded hover:bg-blue-50" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="flex flex-1 justify-center items-center py-1.5 text-red-600 border border-red-200 rounded hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </MobileCard>
            ))}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category.name}</td>
                    <td className="px-4 py-3 text-sm text-right">Rs. {p.sellingPrice}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.isAvailable && p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {p.isAvailable && p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>
        </>
      )}

      {showModal && (
        <div ref={modal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit Product" : "Add Product"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit Product" : "Add Product"}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} aria-label="Product name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} aria-label="Description" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} aria-label="Category" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.01" placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({...form, sellingPrice: e.target.value})} aria-label="Selling price" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="number" step="0.01" placeholder="Cost price" value={form.costPrice} onChange={(e) => setForm({...form, costPrice: e.target.value})} aria-label="Cost price" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <input type="text" placeholder="Unit (e.g. pcs, kg)" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} aria-label="Unit" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.trackStock ? "bg-orange-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.trackStock ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm text-gray-700">Track stock for this product</span>
              </label>
              {!form.trackStock && <p className="text-xs text-gray-400 -mt-1">Sales won&apos;t affect inventory. Good for made-to-order items.</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Add Category" onClick={() => setShowCatModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Category</h2>
            <input type="text" placeholder="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} autoFocus aria-label="Category name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowCatModal(false)} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddCategory} disabled={catSaving} className="flex-1 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50">{catSaving ? "Adding..." : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
