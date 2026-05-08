import { NextRequest } from "next/server";
import { createHash } from "crypto";

// Tell Vercel/Next.js this route may run up to 60 seconds.
// Requires Pro plan for > 10s. With API_TIMEOUT_MS=30000 and
// ENABLE_PROVIDER_FALLBACK=true, the fallback always fires before this limit.
export const maxDuration = 60;
import { AnalyzeRequestSchema } from "@/lib/schemas/analysis";
import type { AnalysisResult } from "@/lib/schemas/analysis";
import { runPipeline, runPipelineMockFallback } from "@/lib/agents/pipeline";

// ─── Abuse protection ─────────────────────────────────────────────────────────
// Best-effort single-process protection for hackathon demo.
// Not distributed or production-grade rate limiting.

const MAX_SPEC_CHARS = 15_000;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface RateRecord {
  count: number;
  resetAt: number;
}
const ipRateMap = new Map<string, RateRecord>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = ipRateMap.get(ip);

  if (!record || now >= record.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}

// ─── In-flight dedupe ─────────────────────────────────────────────────────────
// Prevents duplicate pipeline runs for concurrent identical requests.

const inFlightAnalyses = new Map<string, Promise<AnalysisResult>>();

function requestFingerprint(specText: string, inputType: string, framework: string): string {
  return createHash("sha256")
    .update(JSON.stringify({ specText, inputType, framework }))
    .digest("hex");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Spec length guard — return 413 before Zod validation
  if (
    typeof (body as Record<string, unknown>)?.specText === "string" &&
    (body as { specText: string }).specText.length > MAX_SPEC_CHARS
  ) {
    const len = (body as { specText: string }).specText.length;
    return Response.json(
      { error: `Spec too large (${len.toLocaleString()} chars). Maximum is ${MAX_SPEC_CHARS.toLocaleString()} characters.` },
      { status: 413 }
    );
  }

  // Schema validation
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { specText, inputType, framework } = parsed.data;
  const key = requestFingerprint(specText, inputType, framework);

  // Join existing in-flight run for identical requests
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

  // Start new pipeline run, with optional mock fallback on provider failure
  const promise = (async (): Promise<AnalysisResult> => {
    try {
      return await runPipeline(parsed.data);
    } catch (error) {
      if (
        process.env.PROVIDER === "api" &&
        process.env.ENABLE_PROVIDER_FALLBACK !== "false"
      ) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[specsmith] Provider failed — falling back to mock:", msg);
        return runPipelineMockFallback(parsed.data);
      }
      throw error;
    }
  })().finally(() => {
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
