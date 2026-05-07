import type { AiProvider } from "../providers/index";
import { z } from "zod";
import { TestCaseSchema, type ParsedSpec, type RiskItem, type TestCase } from "../schemas/analysis";

const SYSTEM_PROMPT = `You are a Test Planner agent. Create comprehensive test matrices for QA.
You must respond with valid JSON only. No explanation. No markdown. No code blocks.`;

export async function runTestPlanner(
  provider: AiProvider,
  parsedSpec: ParsedSpec,
  risks: RiskItem[]
): Promise<TestCase[]> {
  const userPrompt = `Create test matrix from this spec and risk registry:

SPEC: ${JSON.stringify(parsedSpec, null, 2)}

RISKS: ${JSON.stringify(risks, null, 2)}

Return a JSON array of test cases. Each test must have:
- id: "T-001", "T-002", etc.
- title: short test title
- category: "happy_path" | "edge_case" | "negative_case" | "regression" | "api_validation" | "abuse_case"
- priority: "LOW" | "MEDIUM" | "HIGH"
- given: precondition
- when: action
- then: expected result
- linkedRiskIds: array of risk IDs this test covers

Rules:
- Every HIGH or CRITICAL risk must have at least one test
- Include all 6 categories
- Set priority HIGH for tests linked to HIGH/CRITICAL risks`;

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
  const userPrompt = `targeted revision: Add tests for these uncovered HIGH/CRITICAL risks:

UNCOVERED RISKS: ${JSON.stringify(uncoveredRisks, null, 2)}

EXISTING TEST IDs (do not duplicate): ${existingTests.map((t) => t.id).join(", ")}

Return a JSON array of NEW test cases starting from T-${String(nextId).padStart(3, "0")}.
Each test must link to at least one of the uncovered risk IDs.
Same schema as before: id, title, category, priority, given, when, then, linkedRiskIds.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return z.array(TestCaseSchema).parse(json);
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(trimmed);
}
