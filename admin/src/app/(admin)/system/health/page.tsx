"use client";

import { useSystemHealth } from "@/lib/hooks";

export default function SystemHealthPage() {
  const { data, isLoading, isError } = useSystemHealth();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">System health</h1>
      <div className="rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span>Backend</span>
          <span className="font-mono">{data.backend}</span>
        </div>
        <div className="flex justify-between">
          <span>Agents</span>
          <span className="font-mono">{data.agents}</span>
        </div>
        <div className="flex justify-between">
          <span>Recent errors (last hour)</span>
          <span className="font-mono">{data.recentErrorCountLastHour}</span>
        </div>
      </div>
    </div>
  );
}