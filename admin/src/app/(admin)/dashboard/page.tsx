"use client";

import { useOverview } from "@/lib/hooks";

export default function DashboardPage() {
  const { data, isLoading, isError } = useOverview();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Teachers" value={data.teachers} />
        <Stat label="Students" value={data.students} />
        <Stat label="Lessons" value={data.lessons} />
        <Stat label="Generation runs" value={data.runs} />
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">Runs by status</h2>
        <ul className="space-y-1 text-sm">
          {Object.entries(data.runsByStatus).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{k}</span>
              <span className="font-mono">{v}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Average latency: {Math.round(data.averageLatencyMs)} ms
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">Recent failures</h2>
        {data.recentFailures.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {data.recentFailures.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span>
                  #{r.id} {r.agent} — {r.status}
                </span>
                <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}