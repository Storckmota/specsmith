import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { AnalyzeRequestSchema } from "@/lib/schemas/analysis";
import type { AnalysisResult } from "@/lib/schemas/analysis";
import { runPipeline } from "@/lib/agents/pipeline";

// Single-process best-effort dedupe — not distributed or production-grade rate limiting.
const inFlightAnalyses = new Map<string, Promise<AnalysisResult>>();

function requestFingerprint(specText: string, inputType: string, framework: string): string {
  return createHash("sha256")
    .update(JSON.stringify({ specText, inputType, framework }))
    .digest("hex");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { specText, inputType, framework } = parsed.data;
  const key = requestFingerprint(specText, inputType, framework);

  const existing = inFlightAnalyses.get(key);
  if (existing) {
    try {
      const result = await existing;
      return Response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pipeline execution failed";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  const promise = runPipeline(parsed.data).finally(() => {
    inFlightAnalyses.delete(key);
  });
  inFlightAnalyses.set(key, promise);

  try {
    const result = await promise;
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pipeline execution failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
