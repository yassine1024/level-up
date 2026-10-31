"use client";

import { useRejections } from "@/lib/hooks";

export default function RejectionsPage() {
  const { data, isLoading, isError } = useRejections();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rejections & fallbacks</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-medium">By status</h2>
          <ul className="space-y-1 text-sm">
            {Object.entries(data.byStatus).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="font-mono">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-medium">By agent</h2>
          <ul className="space-y-1 text-sm">
            {Object.entries(data.byAgent).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="font-mono">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}