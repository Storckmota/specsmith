import { NextRequest } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas/analysis";
import { runPipeline } from "@/lib/agents/pipeline";

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

  try {
    const result = await runPipeline(parsed.data);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pipeline execution failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
