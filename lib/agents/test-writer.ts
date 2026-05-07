import type { AiProvider } from "../providers/index";
import { TestFileSchema, type TestCase, type Framework, type TestFile } from "../schemas/analysis";

const SYSTEM_PROMPT = `You are a Test Writer agent. Generate executable test code from test matrices.
You must respond with valid JSON only. No explanation. No markdown wrapper around the JSON.
The code field inside the JSON may contain code with any syntax.`;

export async function runTestWriter(
  provider: AiProvider,
  tests: TestCase[],
  framework: Framework
): Promise<TestFile> {
  const frameworkInstructions = {
    playwright: "Use @playwright/test with test() and expect(). Include import statement.",
    jest: "Use Jest with describe() and it() blocks. Include necessary imports.",
    pytest: "Use pytest with def test_ functions. Include necessary imports.",
  };

  const userPrompt = `Generate executable test ${framework} code from this test matrix:

${JSON.stringify(tests, null, 2)}

Framework: ${framework}
Instructions: ${frameworkInstructions[framework]}

Return JSON with:
- framework: "${framework}"
- filename: appropriate filename (e.g. "spec.test.ts" for jest, "test_spec.py" for pytest)
- code: the full executable test code as a string

The code must:
- Include all test cases from the matrix
- Use given/when/then as comments or test structure
- Include placeholder assertions that make intent clear
- Be syntactically valid for the framework`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return TestFileSchema.parse(json);
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(trimmed);
}
