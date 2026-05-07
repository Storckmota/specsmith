import type { AiProvider } from "../providers/index";
import { TestFileSchema, type TestCase, type Framework, type TestFile } from "../schemas/analysis";
import { extractJson } from "../utils/json";

const SYSTEM_PROMPT = `You are a Test Writer agent. Generate executable test code from test matrices.

Output rules:
- Return ONLY a raw JSON object. No prose, no explanation, no markdown, no code fences around the JSON itself.
- Your response must start with { and end with }.
- The "code" field is a plain string containing the full test file source — it may contain any language syntax.
- Match the schema exactly: framework, filename, code.`;

export async function runTestWriter(
  provider: AiProvider,
  tests: TestCase[],
  framework: Framework
): Promise<TestFile> {
  const frameworkInstructions: Record<Framework, string> = {
    playwright: "Use @playwright/test with test() and expect(). Include the import statement.",
    jest: "Use Jest with describe() and it() blocks. Include necessary imports.",
    pytest: "Use pytest with def test_ functions. Include necessary imports.",
  };

  const userPrompt = `Generate executable test ${framework} code from this test matrix and return a JSON object only:

${JSON.stringify(tests, null, 2)}

Framework: ${framework}
Instructions: ${frameworkInstructions[framework]}

Return a JSON object with exactly these fields:
- "framework": "${framework}"
- "filename": appropriate test filename (e.g., "spec.test.ts" for jest, "test_spec.py" for pytest)
- "code": the complete executable test source as a single string

The code must:
- Implement all test cases from the matrix
- Use the given/when/then values as test structure or comments
- Include placeholder assertions that communicate intent
- Be syntactically valid ${framework} code

No markdown around the JSON. The code string inside may contain any syntax. Raw JSON object only.`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  const json = extractJson(raw);
  return TestFileSchema.parse(json);
}
