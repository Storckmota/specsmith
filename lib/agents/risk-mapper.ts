import type { AiProvider } from "../providers/index";
import { z } from "zod";
import { RiskItemSchema, type ParsedSpec, type RiskItem } from "../schemas/analysis";
import { extractJson } from "../utils/json";

const SYSTEM_PROMPT = `You are a Risk Mapper agent for QA analysis. Identify and rank testing risks.

Output rules:
- Return ONLY a raw JSON array. No prose, no explanation, no markdown, no code fences.
- Your response must start with [ and end with ].
- Match the schema exactly — no extra fields.
- For sourceRef, use descriptive labels like "User story: login", "Business rule: password policy", or "API endpoint: POST /auth/login". Do not invent file names or line numbers.`;

export async function runRiskMapper(
  provider: AiProvider,
  parsedSpec: ParsedSpec
): Promise<RiskItem[]> {
  const userPrompt = `Identify QA risks from this parsed specification and return a JSON array only:

${JSON.stringify(parsedSpec, null, 2)}

Return a JSON array where each element has exactly these fields:
- "id": "R-001", "R-002", etc. (sequential)
- "title": short risk title
- "description": what the risk is
- "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- "sourceRef": which part of the spec (e.g., "API endpoint: POST /auth/register")
- "whyItMatters": impact if this risk is not tested
- "linkedTestIds": [] (always empty array here)

Focus on: missing validations, ambiguous rules, security flows, edge cases, undefined error behavior.
No markdown. No explanation. Raw JSON array only.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return z.array(RiskItemSchema).parse(json);
}
