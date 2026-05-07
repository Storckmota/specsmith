import type { AiProvider } from "../providers/index";
import { z } from "zod";
import { TestCaseSchema, type ParsedSpec, type RiskItem, type TestCase } from "../schemas/analysis";
import { extractJson } from "../utils/json";

const SYSTEM_PROMPT = `You are a Test Planner agent. Create comprehensive test matrices for QA.

Output rules:
- Return ONLY a raw JSON array. No prose, no explanation, no markdown, no code fences.
- Your response must start with [ and end with ].
- Match the schema exactly — no extra fields.`;

export async function runTestPlanner(
  provider: AiProvider,
  parsedSpec: ParsedSpec,
  risks: RiskItem[]
): Promise<TestCase[]> {
  const userPrompt = `Create test matrix from this spec and risk registry and return a JSON array only:

SPEC: ${JSON.stringify(parsedSpec, null, 2)}

RISKS: ${JSON.stringify(risks, null, 2)}

Return a JSON array where each element has exactly these fields:
- "id": "T-001", "T-002", etc. (sequential)
- "title": short test title
- "category": "happy_path" | "edge_case" | "negative_case" | "regression" | "api_validation" | "abuse_case"
- "priority": "LOW" | "MEDIUM" | "HIGH"
- "given": precondition
- "when": action taken
- "then": expected result
- "linkedRiskIds": array of risk IDs this test covers (e.g., ["R-001"])

Rules:
- Every HIGH or CRITICAL risk must have at least one linked test
- Include tests from all 6 categories
- Set priority HIGH for tests linked to HIGH/CRITICAL risks
No markdown. No explanation. Raw JSON array only.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return z.array(TestCaseSchema).parse(json);
}

export async function runTestPlannerRevision(
  provider: AiProvider,
  uncoveredRisks: RiskItem[],
  existingTests: TestCase[],
  nextId: number
): Promise<TestCase[]> {
  const userPrompt = `targeted revision: Add tests for these uncovered HIGH/CRITICAL risks and return a JSON array only:

UNCOVERED RISKS: ${JSON.stringify(uncoveredRisks, null, 2)}

EXISTING TEST IDs (do not duplicate): ${existingTests.map((t) => t.id).join(", ")}

Return a JSON array of NEW test cases starting from T-${String(nextId).padStart(3, "0")}.
Each test must link to at least one of the uncovered risk IDs in "linkedRiskIds".
Same schema: id, title, category, priority, given, when, then, linkedRiskIds.
No markdown. No explanation. Raw JSON array only.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return z.array(TestCaseSchema).parse(json);
}
