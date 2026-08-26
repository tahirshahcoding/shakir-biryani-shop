"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { useModal } from "@/hooks/use-modal";
import { Pencil, Trash2 } from "lucide-react";

type User = { id: string; name: string; email: string; isActive: boolean; createdAt: string; role: { id: string; name: string } };
type Role = { id: string; name: string };

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });
  const [saving, setSaving] = useState(false);
  const modal = useModal(showModal, () => setShowModal(false));

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([fetch("/api/users").then(r => r.json()), fetch("/api/roles").then(r => r.json())]).then(([u, r]) => {
      setUsers(u.data?.items || []);
      setRoles(r.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load users");
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", password: "", roleId: "" }); setShowModal(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, password: "", roleId: u.role.id }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editing && !form.password) || !form.roleId) {
      toast("All fields required", "error"); return;
    }
    setSaving(true);
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const body = editing ? { ...form, password: form.password || undefined } : form;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { toast(editing ? "User updated" : "User created"); setShowModal(false); load(); }
    else { const d = await res.json(); toast(d.error || "Failed", "error"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast("User deleted"); load(); } else { const d = await res.json(); toast(d.error || "Failed to delete user", "error"); }
  };

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Users</h1><TableSkeleton rows={5} cols={5} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Users</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap">Add User</button>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users" message="Add your first user" action={<button onClick={openAdd} className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">Add User</button>} />
      ) : (
        <>
          <MobileCardGrid>
            {users.map((u) => (
              <MobileCard key={u.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{u.name}</h3>
                  <span className={`ml-2 flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <MobileCardRow label="Email" value={u.email} />
                <MobileCardRow label="Role" value={u.role.name} />
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(u)} className="flex flex-1 justify-center items-center py-1.5 text-blue-600 border border-blue-200 rounded hover:bg-blue-50" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id, u.name)} className="flex flex-1 justify-center items-center py-1.5 text-red-600 border border-red-200 rounded hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </MobileCard>
            ))}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.role.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>
        </>
      )}

      {showModal && (
        <div ref={modal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit User" : "Add User"} onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit User" : "Add User"}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} aria-label="Name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} aria-label="Email" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <input type="password" placeholder={editing ? "New password (blank = keep)" : "Password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} aria-label="Password" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <select value={form.roleId} onChange={(e) => setForm({...form, roleId: e.target.value})} aria-label="Role" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Select role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
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
