"use client";

import { useParams } from "next/navigation";
import { usePipeline, useLessonResources } from "@/lib/hooks";

export default function PipelinePage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError } = usePipeline(id);
  const { data: resData } = useLessonResources(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading pipeline...</p>;
  if (isError || !data) return <p className="text-sm text-destructive">Failed to load pipeline.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-sm text-muted-foreground">
          Lesson {data.lessonId} · content version {data.contentVersion}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">Source upload & extraction</h2>
        {resData?.resources?.length ? (
          <ul className="space-y-2 text-sm">
            {resData.resources.map((r) => (
              <li key={r.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.type}</span>
                  <span className="text-xs text-muted-foreground">{r.extractionStatus ?? "—"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.fileName}</p>
                {r.extractedText && (
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted/30 p-2 text-xs whitespace-pre-wrap">
                    {r.extractedText.slice(0, 1000)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No resources.</p>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">Pipeline steps</h2>
        {data.steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No steps yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.steps.map((s, i) => (
              <li key={i} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.step}</span>
                  <span className="text-xs">{s.status}</span>
                </div>
                {s.validationProblems && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted/30 p-2 text-xs whitespace-pre-wrap">
                    {s.validationProblems}
                  </pre>
                )}
                {s.fallbackUsed && <p className="mt-1 text-xs text-destructive">Fallback used</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}