"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useModal } from "@/hooks/use-modal";
import { DateFilter, type DateRange } from "@/components/ui/date-filter";

type ExpenseCategory = { id: string; name: string; _count: { expenses: number } };
type Expense = { id: string; amount: number; description: string | null; paymentMethod: string; expenseDate: string; category: { id: string; name: string }; createdBy: { name: string } };

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    params.set("page", String(page));

    Promise.all([
      fetch(`/api/expenses?${params}`).then((r) => r.json()),
      fetch("/api/expense-categories").then((r) => r.json()),
    ]).then(([expensesRes, categoriesRes]) => {
      setExpenses(expensesRes.data?.items || []);
      setTotal(expensesRes.data?.total || 0);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load expenses");
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [page, selectedCategory, dateRange]);

  const handleCreate = async (data: { categoryId: string; amount: number; description: string; paymentMethod: string; expenseDate: string }) => {
    const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { toast("Expense created"); setShowAdd(false); loadData(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleUpdate = async (id: string, data: Partial<Expense>) => {
    const res = await fetch(`/api/expenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { toast("Expense updated"); setEditingExpense(null); loadData(); } else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Expense deleted"); loadData(); } else { toast("Failed to delete", "error"); }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Expenses</h1><TableSkeleton rows={5} cols={5} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Expenses</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadData} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 whitespace-nowrap">+ Add Expense</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} aria-label="Filter by category" className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 sm:flex-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses" message="Record your first expense" action={<button onClick={() => setShowAdd(true)} className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">Add Expense</button>} />
      ) : (
        <>
          <MobileCardGrid>
            {expenses.map((expense) => (
              <MobileCard key={expense.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-orange-600">{formatCurrency(expense.amount)}</h3>
                  <span className="text-xs text-gray-500">{formatDate(expense.expenseDate)}</span>
                </div>
                <MobileCardRow label="Category" value={expense.category.name} />
                <MobileCardRow label="Method" value={expense.paymentMethod} />
                {expense.description && <MobileCardRow label="Note" value={expense.description} />}
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button onClick={() => setEditingExpense(expense)} className="flex flex-1 justify-center items-center py-1.5 text-blue-600 border border-blue-200 rounded hover:bg-blue-50" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(expense.id)} className="flex flex-1 justify-center items-center py-1.5 text-red-600 border border-red-200 rounded hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </MobileCard>
            ))}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(expense.expenseDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.category.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.description || "-"}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditingExpense(expense)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">Total:</td>
                  <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </DesktopTable>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">Total: {total} expenses</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <span className="px-3 py-1.5 text-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={expenses.length < 25} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </>
      )}

      {showAdd && <ExpenseForm categories={categories} onSubmit={handleCreate} onClose={() => setShowAdd(false)} />}
      {editingExpense && <ExpenseForm categories={categories} initial={editingExpense} onSubmit={(data) => handleUpdate(editingExpense.id, data)} onClose={() => setEditingExpense(null)} />}
    </div>
  );
}

function ExpenseForm({ categories, initial, onSubmit, onClose }: {
  categories: ExpenseCategory[];
  initial?: Expense;
  onSubmit: (data: { categoryId: string; amount: number; description: string; paymentMethod: string; expenseDate: string }) => void;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(initial?.category.id || "");
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || "CASH");
  const [expenseDate, setExpenseDate] = useState(initial?.expenseDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const isOpen = true;
  const modal = useModal(isOpen, onClose);

  return (
    <div ref={modal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={initial ? "Edit expense" : "Add expense"} onClick={onClose}>
      <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{initial ? "Edit" : "Add"} Expense</h2>
        <div className="space-y-3">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category" className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" aria-label="Amount" className="w-full px-3 py-2 border rounded-md text-sm" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" aria-label="Description" className="w-full px-3 py-2 border rounded-md text-sm" />
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} aria-label="Payment method" className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="CASH">Cash</option><option value="CARD">Card</option><option value="ONLINE">Online</option><option value="OTHER">Other</option>
          </select>
          <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} aria-label="Date" className="w-full px-3 py-2 border rounded-md text-sm" />
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={() => categoryId && amount && onSubmit({ categoryId, amount: parseFloat(amount), description, paymentMethod, expenseDate })} disabled={!categoryId || !amount} className="flex-1 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50">{initial ? "Update" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
