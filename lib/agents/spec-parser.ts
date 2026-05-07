import type { AiProvider } from "../providers/index";
import { ParsedSpecSchema, type ParsedSpec, type InputType } from "../schemas/analysis";

const SYSTEM_PROMPT = `You are a Spec Parser agent. Extract structured information from product specifications.
You must respond with valid JSON only. No explanation. No markdown. No code blocks.`;

export async function runSpecParser(
  provider: AiProvider,
  specText: string,
  inputType: InputType
): Promise<ParsedSpec> {
  const userPrompt = `Extract structured information from this ${inputType} specification:

${specText}

Return JSON matching this schema:
{
  "title": "short title for this spec",
  "detectedScope": "one sentence describing the scope",
  "userStories": ["array of user stories found or inferred"],
  "businessRules": ["array of business rules and constraints"],
  "apiEndpoints": ["array of API endpoints if any"],
  "assumptions": ["array of implicit assumptions"],
  "constraints": ["array of explicit constraints"]
}`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return ParsedSpecSchema.parse(json);
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  // Strip markdown code fences if present
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(trimmed);
}
