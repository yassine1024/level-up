"use client";

import { useState } from "react";
import { useTeachers } from "@/lib/hooks";

export default function TeachersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useTeachers(page, 20);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Teachers</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Uploads</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Last login</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2 font-mono">{t.id}</td>
                <td className="px-3 py-2">{t.username}</td>
                <td className="px-3 py-2">{t.uploadCount ?? 0}</td>
                <td className="px-3 py-2">{t.createdAt ? new Date(t.createdAt).toLocaleString() : "—"}</td>
                <td className="px-3 py-2">{t.lastLoginAt ? new Date(t.lastLoginAt).toLocaleString() : "—"}</td>
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