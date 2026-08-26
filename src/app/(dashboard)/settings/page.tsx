"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSettings(res.data);
        else setError(res.error || "Failed to load settings");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) { toast("Settings saved"); setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else { toast("Failed to save settings", "error"); }
    } catch {
      toast("Network error", "error");
    }
    setSaving(false);
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) { toast("Backup failed", "error"); setBackupLoading(false); return; }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : "biryani-backup.db";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast("Backup downloaded");
    } catch { toast("Backup failed", "error"); }
    setBackupLoading(false);
  };

  const handleRestore = async (file: File) => {
    if (!confirm("Restore this backup? Current data will be replaced. A backup of the current data will be saved first.")) return;
    setRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append("backup", file);
      const res = await fetch("/api/backup/restore", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { toast("Database restored! Please refresh the page."); }
      else { toast(data.error || "Restore failed", "error"); }
    } catch { toast("Restore failed", "error"); }
    setRestoreLoading(false);
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j}><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-10 bg-gray-100 rounded"></div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  const settingGroups = [
    {
      title: "Business Profile",
      fields: [
        { key: "BUSINESS_NAME", label: "Business Name", type: "text" },
        { key: "BUSINESS_PHONE", label: "Phone Number", type: "tel" },
        { key: "BUSINESS_ADDRESS", label: "Address", type: "text" },
      ],
    },
    {
      title: "Configuration",
      fields: [
        { key: "CURRENCY", label: "Currency", type: "text" },
        { key: "CURRENCY_SYMBOL", label: "Currency Symbol", type: "text" },
        { key: "TAX_RATE", label: "Tax Rate (%)", type: "number" },
        { key: "INVOICE_PREFIX", label: "Invoice Prefix", type: "text" },
        { key: "LOW_STOCK_THRESHOLD", label: "Low Stock Threshold", type: "number" },
        { key: "TIMEZONE", label: "Timezone", type: "text" },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    id={field.key}
                    type={field.type}
                    value={settings[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Backup & Restore */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleBackup} disabled={backupLoading} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
            {backupLoading ? "Backing up..." : "Download Backup"}
          </button>
          <input ref={fileInputRef} type="file" accept=".db" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRestore(f); e.target.value = ""; }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={restoreLoading} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {restoreLoading ? "Restoring..." : "Restore from Backup"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Download creates a copy of the database. Restore replaces current data (a safety backup is saved first).</p>
      </div>
    </div>
  );
}
