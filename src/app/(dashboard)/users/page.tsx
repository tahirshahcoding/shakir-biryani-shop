"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { useModal } from "@/hooks/use-modal";
import { Pencil, Trash2, Shield } from "lucide-react";

type User = { id: string; name: string; email: string; isActive: boolean; createdAt: string; role: { id: string; name: string } };
type RoleOption = { id: string; name: string };
type RoleDetail = { id: string; name: string; description: string | null; permissions: { code: string; description: string | null }[] };
type Permission = { id: string; code: string; description: string | null };

const PERMISSION_CATEGORIES: Record<string, string[]> = {
  "Dashboard": ["DASHBOARD_VIEW"],
  "Products": ["PRODUCTS_VIEW", "PRODUCTS_CREATE", "PRODUCTS_EDIT", "PRODUCTS_DELETE"],
  "Categories": ["CATEGORIES_VIEW", "CATEGORIES_CREATE", "CATEGORIES_EDIT", "CATEGORIES_DELETE"],
  "Sales": ["SALES_VIEW", "SALES_CREATE", "SALES_VOID", "SALES_VIEW_ALL"],
  "Inventory": ["INVENTORY_VIEW", "INVENTORY_ADJUST", "INVENTORY_VIEW_ALL"],
  "Expenses": ["EXPENSES_VIEW", "EXPENSES_CREATE", "EXPENSES_EDIT", "EXPENSES_DELETE"],
  "Reports": ["REPORTS_VIEW", "REPORTS_EXPORT"],
  "Users": ["USERS_VIEW", "USERS_CREATE", "USERS_EDIT", "USERS_DELETE"],
  "Roles": ["ROLES_MANAGE"],
  "Settings": ["SETTINGS_VIEW", "SETTINGS_EDIT"],
};

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleDetails, setRoleDetails] = useState<RoleDetail[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });
  const [saving, setSaving] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null);
  const [rolePerms, setRolePerms] = useState<Set<string>>(new Set());
  const [roleSaving, setRoleSaving] = useState(false);
  const modal = useModal(showModal, () => setShowModal(false));
  const roleModal = useModal(showRoleModal, () => setShowRoleModal(false));

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/roles?detail=true").then(r => r.json()),
      fetch("/api/roles?permissions=true").then(r => r.json()),
    ]).then(([u, rd, perms]) => {
      setUsers(u.data?.items || []);
      setRoles((rd.data || []).map((r: RoleDetail) => ({ id: r.id, name: r.name })));
      setRoleDetails(rd.data || []);
      setAllPermissions(perms.data || []);
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

  const openRoleEdit = (role: RoleDetail) => {
    setEditingRole(role);
    setRolePerms(new Set(role.permissions.map((p) => p.code)));
    setShowRoleModal(true);
  };

  const togglePerm = (code: string) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleCategory = (codes: string[]) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      const allSelected = codes.every((c) => next.has(c));
      codes.forEach((c) => { if (allSelected) next.delete(c); else next.add(c); });
      return next;
    });
  };

  const handleRoleSave = async () => {
    if (!editingRole) return;
    setRoleSaving(true);
    const res = await fetch(`/api/roles/${editingRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionCodes: Array.from(rolePerms) }),
    });
    setRoleSaving(false);
    if (res.ok) { toast("Role permissions updated"); setShowRoleModal(false); load(); }
    else { const d = await res.json(); toast(d.error || "Failed to update role", "error"); }
  };

  const permCodeToLabel = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of allPermissions) map[p.code] = p.description || p.code;
    return map;
  }, [allPermissions]);

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
    <div className="space-y-8">
      {/* Users Section */}
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
      </div>

      {/* Roles & Permissions Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Roles & Permissions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleDetails.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
                  {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                </div>
                <button onClick={() => openRoleEdit(role)} className="p-1.5 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors" title="Edit permissions">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No permissions</span>
                ) : (
                  role.permissions.map((p) => (
                    <span key={p.code} className="inline-flex px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-medium rounded">
                      {p.code.replace(/_/g, " ")}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Modal */}
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

      {/* Role Permissions Modal */}
      {showRoleModal && editingRole && (
        <div ref={roleModal.overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={`Edit ${editingRole.name} Permissions`} onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">{editingRole.name} Permissions</h2>
            {editingRole.description && <p className="text-xs text-gray-500 mb-4">{editingRole.description}</p>}
            <div className="space-y-4">
              {Object.entries(PERMISSION_CATEGORIES).map(([cat, codes]) => {
                const allIn = codes.every((c) => rolePerms.has(c));
                const someIn = codes.some((c) => rolePerms.has(c));
                return (
                  <div key={cat}>
                    <label className="flex items-center gap-2 mb-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allIn}
                        ref={(el) => { if (el) el.indeterminate = someIn && !allIn; }}
                        onChange={() => toggleCategory(codes)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{cat}</span>
                    </label>
                    <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {codes.map((code) => (
                        <label key={code} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rolePerms.has(code)}
                            onChange={() => togglePerm(code)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-xs text-gray-700">{permCodeToLabel[code] || code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowRoleModal(false)} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleRoleSave} disabled={roleSaving} className="flex-1 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50">{roleSaving ? "Saving..." : "Save Permissions"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
