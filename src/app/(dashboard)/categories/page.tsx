"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { useModal } from "@/hooks/use-modal";
import { Pencil, Trash2 } from "lucide-react";

type Category = { id: string; name: string; description: string | null; sortOrder: number | null; isActive: boolean; _count: { products: number } };

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "" });
  const [saving, setSaving] = useState(false);
  const modal = useModal(showModal, () => setShowModal(false));

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/categories").then(r => r.json()).then(res => {
      setCategories(res.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load categories");
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", sortOrder: "" }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description || "", sortOrder: c.sortOrder ? String(c.sortOrder) : "" }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast("Name required", "error"); return; }
    setSaving(true);
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const body = { name: form.name, description: form.description || null, sortOrder: form.sortOrder ? parseInt(form.sortOrder) : null };
    const method = editing ? "PATCH" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setSaving(false);
      if (res.ok) { toast(editing ? "Category updated" : "Category created"); setShowModal(false); load(); }
      else { const d = await res.json(); toast(d.error || "Failed", "error"); }
    } catch (error) {
      setSaving(false);
      toast("Network error. Please try again.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Products in this category will remain but become uncategorized.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) { toast("Category deleted"); load(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
    } catch (error) {
      toast("Network error. Please try again.", "error");
    }
  };

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Categories</h1><TableSkeleton rows={5} cols={4} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Categories</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">Add Category</button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" message="Create your first category" />
      ) : (
        <>
          {/* Mobile: card view */}
          <div className="space-y-3 sm:hidden">
            {categories.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{c.isActive ? "Active" : "Inactive"}</span>
                </div>
                {c.description && <p className="text-sm text-gray-500 mb-2">{c.description}</p>}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{c._count.products} products</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table view */}
          <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sort</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.description || "-"}</td>
                    <td className="px-4 py-3 text-sm text-center">{c._count.products}</td>
                    <td className="px-4 py-3 text-sm text-center">{c.sortOrder ?? "-"}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div ref={modal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit category" : "Add category"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit Category" : "Add Category"}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" aria-label="Category name" />
              <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" aria-label="Category description" />
              <input type="number" placeholder="Sort order (optional)" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" aria-label="Sort order" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
