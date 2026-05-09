import { z } from "zod";
import type { AiProvider } from "../providers/index";
import { extractJson } from "../utils/json";
import {
  SeveritySchema,
  TestCategorySchema,
  PrioritySchema,
  type AnalyzeRequest,
  type AnalysisResult,
  type Framework,
  type RiskItem,
  type TestCase,
} from "../schemas/analysis";

// ─── Response schema ──────────────────────────────────────────────────────────
// Asks the model for a flat structure (risks/tests rather than riskRegistry/
// testMatrix) to keep the prompt concise, then maps to AnalysisResult.

const FastRiskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: SeveritySchema,
  sourceRef: z.string(),
  whyItMatters: z.string(),
  linkedTestIds: z.array(z.string()).default([]),
});

const FastTestSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: TestCategorySchema,
  priority: PrioritySchema,
  given: z.string(),
  when: z.string(),
  then: z.string(),
  linkedRiskIds: z.array(z.string()).default([]),
});

const FastResponseSchema = z.object({
  title: z.string(),
  detectedScope: z.string(),
  risks: z.array(FastRiskSchema).min(1).max(8),
  tests: z.array(FastTestSchema).min(1).max(15),
  coverageScore: z.number().min(0).max(100),
  coverageSummary: z.string(),
  gaps: z.array(z.string()),
  reviewerFeedback: z.string(),
});

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are SpecSmith, an expert QA analyst. Analyze the provided specification and return a complete QA Forge Report as a single JSON object.
Output JSON only. No markdown fences. No prose before or after the JSON.`;

function buildPrompt(specText: string, inputType: string, framework: string): string {
  return `Analyze this ${inputType} specification for QA risks and test cases.

SPEC:
${specText}

Return exactly this JSON structure (no markdown, no extra text):
{
  "title": "concise spec title",
  "detectedScope": "one sentence describing what this spec covers",
  "risks": [
    {
      "id": "R-001",
      "title": "risk title",
      "description": "what could go wrong",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "sourceRef": "which part of the spec this comes from",
      "whyItMatters": "why this matters in production",
      "linkedTestIds": ["T-001"]
    }
  ],
  "tests": [
    {
      "id": "T-001",
      "title": "test case title",
      "category": "happy_path|edge_case|negative_case|regression|api_validation|abuse_case",
      "priority": "HIGH|MEDIUM|LOW",
      "given": "precondition state",
      "when": "action taken",
      "then": "expected outcome",
      "linkedRiskIds": ["R-001"]
    }
  ],
  "coverageScore": 85,
  "coverageSummary": "brief coverage summary sentence",
  "gaps": ["any uncovered risks or missing test categories"],
  "reviewerFeedback": "single sentence QA reviewer conclusion"
}

Rules:
- Generate 4–6 risks based on the actual spec content
- Generate 6–10 test cases covering as many of these 6 categories as possible: happy_path, edge_case, negative_case, regression, api_validation, abuse_case
- Every CRITICAL and HIGH risk must have at least one linked test ID
- Use sequential IDs: R-001, R-002... and T-001, T-002...
- Base all findings on the actual spec provided — do not invent features not in the spec
- Test framework for the analysis context: ${framework}
- JSON only, no other text`;
}

// ─── Deterministic test file generator ───────────────────────────────────────
// Generates real, syntactically valid test code from the parsed test cases.
// This avoids asking the model to JSON-escape code, which is unreliable at 7B.

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function generateTestFile(
  title: string,
  tests: TestCase[],
  framework: Framework
): { filename: string; code: string } {
  const safeTitle = esc(title);

  if (framework === "playwright") {
    const blocks = tests
      .map(
        (t) =>
          `  test("${sanitizeId(t.id)}: ${esc(t.title)}", async ({ request }) => {\n` +
          `    // Given: ${t.given}\n` +
          `    // When: ${t.when}\n` +
          `    // Then: ${t.then}\n` +
          `    // TODO: wire request and assertion\n` +
          `  });`
      )
      .join("\n\n");

    return {
      filename: "forge.spec.ts",
      code:
        `import { test, expect } from "@playwright/test";\n\n` +
        `const BASE_URL = process.env.BASE_URL || "http://localhost:3000";\n\n` +
        `test.describe("${safeTitle}", () => {\n${blocks}\n});\n`,
    };
  }

  if (framework === "jest") {
    const blocks = tests
      .map(
        (t) =>
          `  it("${sanitizeId(t.id)}: ${esc(t.title)}", () => {\n` +
          `    // Given: ${t.given}\n` +
          `    // When: ${t.when}\n` +
          `    // Then: ${t.then}\n` +
          `    // TODO: wire assertion\n` +
          `    expect(true).toBe(true);\n` +
          `  });`
      )
      .join("\n\n");

    return {
      filename: "forge.test.ts",
      code: `describe("${safeTitle}", () => {\n${blocks}\n});\n`,
    };
  }

  // pytest
  const blocks = tests
    .map((t) => {
      const fnName = `test_${sanitizeId(t.id).toLowerCase()}_${t.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 40)}`;
      return (
        `def ${fnName}():\n` +
        `    """${t.title}\n` +
        `    Given: ${t.given}\n` +
        `    When: ${t.when}\n` +
        `    Then: ${t.then}\n` +
        `    """\n` +
        `    # TODO: wire assertion\n` +
        `    assert True`
      );
    })
    .join("\n\n\n");

  return {
    filename: "test_forge.py",
    code: `"""${safeTitle} — generated test draft"""\n\n\n${blocks}\n`,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runFastAnalysis(
  provider: AiProvider,
  request: AnalyzeRequest
): Promise<AnalysisResult> {
  const raw = await provider.complete(
    SYSTEM_PROMPT,
    buildPrompt(request.specText, request.inputType, request.framework)
  );

  let parsed: z.infer<typeof FastResponseSchema>;
  try {
    const json = extractJson(raw);
    parsed = FastResponseSchema.parse(json);
  } catch (err) {
    const preview =
      process.env.DEBUG_AGENT_OUTPUT === "true"
        ? ` Preview: ${raw.slice(0, 300)}`
        : "";
    throw new Error(
      `Fast analysis: model response did not match expected schema.${preview}`
    );
  }

  // Map risks — fill in linkedTestIds from cross-referenced test cases
  const risks: RiskItem[] = parsed.risks.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    severity: r.severity,
    sourceRef: r.sourceRef,
    whyItMatters: r.whyItMatters,
    linkedTestIds: parsed.tests
      .filter((t) => t.linkedRiskIds.includes(r.id))
      .map((t) => t.id),
  }));

  // Map tests
  const tests: TestCase[] = parsed.tests.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    given: t.given,
    when: t.when,
    then: t.then,
    linkedRiskIds: t.linkedRiskIds,
  }));

  // Deterministically generate the test file from parsed test cases
  const { filename, code } = generateTestFile(
    parsed.title,
    tests,
    request.framework
  );

  // Build the 5-agent timeline so the UI card grid renders correctly
  const agentTimeline: AnalysisResult["agentTimeline"] = [
    { agent: "Spec Parser", status: "complete", message: `Extracted scope: ${parsed.detectedScope.slice(0, 80)}` },
    { agent: "Risk Mapper", status: "complete", message: `Found ${risks.length} risks (${risks.filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH").length} HIGH/CRITICAL)` },
    { agent: "Test Planner", status: "complete", message: `Created ${tests.length} test cases across ${new Set(tests.map((t) => t.category)).size} categories` },
    { agent: "Test Writer", status: "complete", message: `Generated ${filename} (${request.framework})` },
    { agent: "QA Reviewer", status: "complete", message: `Score: ${parsed.coverageScore}/100` },
  ];

  return {
    summary: {
      title: parsed.title,
      inputType: request.inputType,
      detectedScope: parsed.detectedScope,
    },
    riskRegistry: risks,
    testMatrix: tests,
    testFile: {
      framework: request.framework,
      filename,
      code,
    },
    coverage: {
      score: parsed.coverageScore,
      summary: parsed.coverageSummary,
      gaps: parsed.gaps,
      reviewerFeedback: parsed.reviewerFeedback,
      plannerRevised: false,
    },
    providerMode: "API mode · Fast demo",
    agentTimeline,
  };
}
