"use client";

import { useActivity } from "@/lib/hooks";

export default function ActivityPage() {
  const { data, isLoading, isError } = useActivity();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activity feed</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Agent</th>
              <th className="px-3 py-2 text-left">Lesson</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={`${a.type}-${a.id}`} className="border-t">
                <td className="px-3 py-2">{a.type}</td>
                <td className="px-3 py-2 font-mono">{a.id}</td>
                <td className="px-3 py-2">{a.status ?? "—"}</td>
                <td className="px-3 py-2">{a.agent ?? "—"}</td>
                <td className="px-3 py-2">{a.lessonId ?? "—"}</td>
                <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}