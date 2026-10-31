"use client";

import { useState } from "react";
import Link from "next/link";
import { useLessons } from "@/lib/hooks";

export default function LessonsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useLessons(page, 20);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lessons</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Level</th>
              <th className="px-3 py-2 text-left">Unit</th>
              <th className="px-3 py-2 text-left">Version</th>
              <th className="px-3 py-2 text-left">Resources</th>
              <th className="px-3 py-2 text-left">Runs</th>
              <th className="px-3 py-2 text-left">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2 font-mono">{l.id}</td>
                <td className="px-3 py-2">{l.title}</td>
                <td className="px-3 py-2">{l.level}</td>
                <td className="px-3 py-2">{l.unit}</td>
                <td className="px-3 py-2">{l.contentVersion}</td>
                <td className="px-3 py-2">{l.resourceCount}</td>
                <td className="px-3 py-2">{l.runCount}</td>
                <td className="px-3 py-2">
                  <Link href={`/lessons/${l.id}/pipeline`} className="text-primary underline">
                    View
                  </Link>
                </td>
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