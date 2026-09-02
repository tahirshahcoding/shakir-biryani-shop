"use client";

import { useState, useEffect, useCallback } from "react";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { MobileCard, MobileCardRow, MobileCardGrid, DesktopTable } from "@/components/ui/mobile-card";
import { formatDateTime } from "@/lib/format";

type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: "50" });
    if (search) params.set("userId", search);
    fetch(`/api/audit?${params}`, { cache: "no-store" }).then((r) => r.json()).then((res) => {
      if (!res.success) { setError(res.error || "Failed to load audit log"); setLoading(false); return; }
      setEntries(res.data?.items || []);
      setTotal(res.data?.total || 0);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load audit log");
      setLoading(false);
    });
  }, [page, search]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-bold text-gray-900">Audit Log</h1><TableSkeleton rows={5} cols={5} /></div>;

  if (error) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Audit Log</h1>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by user ID..." aria-label="Filter audit log" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-64" />
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No audit entries" message="Actions taken by users will appear here" />
      ) : (
        <>
          <MobileCardGrid>
            {entries.map((e) => (
              <MobileCard key={e.id}>
                <h3 className="text-sm font-medium text-gray-900 truncate">{e.action}</h3>
                <MobileCardRow label="User" value={e.user ? e.user.name : "System"} />
                <MobileCardRow label="Entity" value={`${e.entityType} • ${e.entityId}`} />
                <MobileCardRow label="When" value={formatDateTime(e.createdAt)} />
              </MobileCard>
            ))}
          </MobileCardGrid>

          <DesktopTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{e.user ? e.user.name : "System"}</td>
                    <td className="px-4 py-3 text-sm">{e.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.entityType}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{e.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>

          <div className="flex items-center justify-between gap-4 pt-2 text-sm text-gray-600">
            <p>Total: {total} entries</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <span className="px-3 py-1.5 text-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 50 >= total} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}