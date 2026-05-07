import type { AiProvider } from "../providers/index";
import { z } from "zod";
import { RiskItemSchema, type ParsedSpec, type RiskItem } from "../schemas/analysis";

const SYSTEM_PROMPT = `You are a Risk Mapper agent for QA analysis. Identify and rank testing risks.
You must respond with valid JSON only. No explanation. No markdown. No code blocks.`;

export async function runRiskMapper(
  provider: AiProvider,
  parsedSpec: ParsedSpec
): Promise<RiskItem[]> {
  const userPrompt = `Identify QA risks from this parsed specification:

${JSON.stringify(parsedSpec, null, 2)}

Return a JSON array of risk items. Each risk must have:
- id: "R-001", "R-002", etc.
- title: short title
- description: what the risk is
- severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- sourceRef: which part of the spec this came from
- whyItMatters: impact if this risk is not tested
- linkedTestIds: [] (empty for now)

Focus on: missing validations, ambiguous rules, security flows, edge cases, undefined error behavior.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return z.array(RiskItemSchema).parse(json);
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(trimmed);
}
