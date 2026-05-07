import type { AiProvider } from "../providers/index";
import { ParsedSpecSchema, type ParsedSpec, type InputType } from "../schemas/analysis";
import { extractJson } from "../utils/json";

const SYSTEM_PROMPT = `You are a Spec Parser agent. Extract structured information from product specifications.

Output rules:
- Return ONLY a raw JSON object. No prose, no explanation, no markdown, no code fences.
- Your response must start with { and end with }.
- Match the schema exactly — no extra fields.`;

export async function runSpecParser(
  provider: AiProvider,
  specText: string,
  inputType: InputType
): Promise<ParsedSpec> {
  const userPrompt = `Extract structured information from this ${inputType} specification and return valid JSON only:

${specText}

Return a JSON object with exactly these fields:
{
  "title": "short title for this spec",
  "detectedScope": "one sentence describing the scope",
  "userStories": ["array of user stories found or inferred"],
  "businessRules": ["array of business rules and constraints"],
  "apiEndpoints": ["array of API endpoints if any, empty array if none"],
  "assumptions": ["array of implicit assumptions"],
  "constraints": ["array of explicit constraints"]
}

No markdown. No explanation. Raw JSON only.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return ParsedSpecSchema.parse(json);
}
