import type { AiProvider } from "../providers/index";
import { TestFileSchema, type TestCase, type Framework, type TestFile } from "../schemas/analysis";

function debugPreview(s: string, len: number): string {
  return process.env.DEBUG_AGENT_OUTPUT === "true" ? ` Preview: ${s.slice(0, len)}` : "";
}

const META_TAG = "===METADATA===";
const CODE_TAG = "===CODE===";
const END_TAG = "===END===";

const SYSTEM_PROMPT = `You are a Test Writer agent. Generate executable test code from test matrices.

Output format — follow EXACTLY, no exceptions:

===METADATA===
{"framework":"playwright","filename":"example.spec.ts"}
===CODE===
import { test, expect } from '@playwright/test';
// test code here
===END===

Rules:
1. ===METADATA=== must be the very first line of your response.
2. The line immediately after ===METADATA=== must be a single-line JSON object with "framework" and "filename" only.
3. ===CODE=== must appear on its own line immediately after the metadata JSON line.
4. Everything between ===CODE=== and ===END=== is raw source code — write it exactly as-is.
5. ===END=== must be the very last line of your response.
6. Do NOT add markdown code fences (\`\`\`), explanations, or any text outside the three delimiter sections.
7. Do NOT wrap the code in a JSON string. Do NOT escape the code. Write raw source.
8. Every delimiter must appear on its own line, exactly as written above.`;

function normalizeDelimiters(raw: string): string {
  return raw
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (t === META_TAG || t === CODE_TAG || t === END_TAG) return t;
      return line;
    })
    .join("\n");
}

function parseTestWriterOutput(raw: string, framework: Framework): TestFile {
  const normalized = normalizeDelimiters(raw);

  const metaIdx = normalized.indexOf(META_TAG);
  const codeIdx = normalized.indexOf(CODE_TAG);
  const endIdx = normalized.lastIndexOf(END_TAG);

  if (metaIdx === -1 || codeIdx === -1 || endIdx === -1) {
    throw new Error(`Test Writer: delimiters missing.${debugPreview(raw, 400)}`);
  }

  if (!(metaIdx < codeIdx && codeIdx < endIdx)) {
    throw new Error("Test Writer: delimiters out of order (expected METADATA < CODE < END).");
  }

  const metaRaw = normalized.slice(metaIdx + META_TAG.length, codeIdx).trim();
  const code = normalized.slice(codeIdx + CODE_TAG.length, endIdx).trim();

  let meta: { framework?: string; filename?: string };
  try {
    meta = JSON.parse(metaRaw);
  } catch {
    throw new Error(`Test Writer: metadata JSON invalid.${debugPreview(metaRaw, 200)}`);
  }

  const ext = framework === "pytest" ? "py" : "ts";
  return TestFileSchema.parse({
    framework: meta.framework ?? framework,
    filename: meta.filename ?? `spec.${ext}`,
    code,
  });
}

function isProviderError(err: unknown): boolean {
  return err instanceof Error && err.message.startsWith("API provider");
}

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

  const userPrompt = `Generate executable ${framework} test code from this test matrix:

${JSON.stringify(tests, null, 2)}

Framework: ${framework}
Instructions: ${frameworkInstructions[framework]}

The code must:
- Implement all test cases from the matrix
- Use the given/when/then values as test structure or comments
- Include placeholder assertions that communicate intent
- Be syntactically valid ${framework} code

Return using this exact format — ===METADATA=== must be the very first line:
===METADATA===
{"framework":"${framework}","filename":"<appropriate filename>"}
===CODE===
<full test source code — raw, no markdown fences>
===END===`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);

  try {
    return parseTestWriterOutput(raw, framework);
  } catch (firstError) {
    if (isProviderError(firstError)) throw firstError;

    // One retry: pass the bad output back and ask for a reformat
    const repairPrompt = `Your previous response did not follow the required ===METADATA=== / ===CODE=== / ===END=== format.

Reformat it now. Return ONLY the structure below — ===METADATA=== must be the very first line:

===METADATA===
{"framework":"${framework}","filename":"<filename>"}
===CODE===
<the test code, raw source, no markdown fences, no JSON escaping>
===END===

Your previous output to reformat:
---
${raw}
---`;

    const rawRetry = await provider.complete(SYSTEM_PROMPT, repairPrompt);
    return parseTestWriterOutput(rawRetry, framework);
  }
}
