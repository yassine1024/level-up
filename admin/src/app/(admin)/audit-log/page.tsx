"use client";

import { useState } from "react";
import { useAuditLog } from "@/lib/hooks";

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useAuditLog(page, 20);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Admin</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Target</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2 font-mono">{a.id}</td>
                <td className="px-3 py-2">{a.adminUserId ?? "—"}</td>
                <td className="px-3 py-2">{a.action}</td>
                <td className="px-3 py-2">
                  {a.targetType ?? "—"} {a.targetId ?? ""}
                </td>
                <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="rounded-md border px-3 py-1 disabled:opacity-50">
          Prev
        </button>
        <span>Page {page + 1} of {Math.max(data.totalPages, 1)}</span>
        <button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1 disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}