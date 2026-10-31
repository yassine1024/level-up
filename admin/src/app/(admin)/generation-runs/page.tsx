"use client";

import { useState } from "react";
import { useGenerationRuns } from "@/lib/hooks";

export default function GenerationRunsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useGenerationRuns(page, 20, status || undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Generation runs</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="rounded-md border px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="ACCEPTED_AFTER_RETRY">ACCEPTED_AFTER_RETRY</option>
          <option value="REJECTED_VALIDATION">REJECTED_VALIDATION</option>
          <option value="FALLBACK_USED">FALLBACK_USED</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load runs.</p>}
      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Lesson</th>
                  <th className="px-3 py-2 text-left">Attempts</th>
                  <th className="px-3 py-2 text-left">Latency</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-mono">{r.id}</td>
                    <td className="px-3 py-2">{r.agent}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2">{r.lessonId ?? "—"}</td>
                    <td className="px-3 py-2">{r.attempts}</td>
                    <td className="px-3 py-2">{r.latencyMs ?? "—"} ms</td>
                    <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <button
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}