"use client";

import { useState } from "react";
import { useGeneratedContent, useHideContent } from "@/lib/hooks";

export default function ContentReviewPage() {
  const [type, setType] = useState("exercise");
  const [id, setId] = useState("");
  const numericId = Number(id);
  const { data, isLoading, isError } = useGeneratedContent(type, numericId);
  const hide = useHideContent();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Content review</h1>
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border px-2 py-1 text-sm">
          <option value="exercise">exercise</option>
          <option value="slide">slide</option>
        </select>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Generated content id"
          className="rounded-md border px-3 py-1 text-sm"
        />
      </div>
      {numericId > 0 && isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {numericId > 0 && isError && <p className="text-sm text-destructive">Failed to load.</p>}
      {data && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {data.type} #{data.id} · version {data.contentVersion}
            </span>
            <button
              onClick={() => hide.mutate({ type, id: numericId, hidden: !data.hidden })}
              className="rounded-md border px-3 py-1 text-sm"
            >
              {data.hidden ? "Unhide" : "Hide"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Hidden: {String(data.hidden)} · run: {data.generationRunId ?? "—"}
          </p>
          <pre className="max-h-96 overflow-auto rounded bg-muted/30 p-3 text-xs whitespace-pre-wrap">
            {data.questionsJson ?? data.slidesJson ?? ""}
          </pre>
        </div>
      )}
    </div>
  );
}