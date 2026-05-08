import type { AiProvider } from "../providers/index";
import { TestFileSchema, type TestCase, type Framework, type TestFile } from "../schemas/analysis";

const META_TAG = "===METADATA===";
const CODE_TAG = "===CODE===";
const END_TAG = "===END===";

const SYSTEM_PROMPT = `You are a Test Writer agent. Generate executable test code from test matrices.

Respond using EXACTLY this format — delimiters must appear on their own lines:
===METADATA===
{"framework":"<framework>","filename":"<filename>"}
===CODE===
<full test source code — any syntax, no restrictions>
===END===

Do not output anything before ===METADATA=== or after ===END===.`;

function parseTestWriterOutput(raw: string, framework: Framework): TestFile {
  const metaIdx = raw.indexOf(META_TAG);
  const codeIdx = raw.indexOf(CODE_TAG);
  const endIdx = raw.lastIndexOf(END_TAG);

  if (metaIdx === -1 || codeIdx === -1 || endIdx === -1) {
    throw new Error(`Test Writer: delimiters missing. Preview: ${raw.slice(0, 400)}`);
  }

  const metaRaw = raw.slice(metaIdx + META_TAG.length, codeIdx).trim();
  const code = raw.slice(codeIdx + CODE_TAG.length, endIdx).trim();

  let meta: { framework?: string; filename?: string };
  try {
    meta = JSON.parse(metaRaw);
  } catch {
    throw new Error(`Test Writer: metadata JSON invalid. Preview: ${metaRaw.slice(0, 200)}`);
  }

  const ext = framework === "pytest" ? "py" : "ts";
  return TestFileSchema.parse({
    framework: meta.framework ?? framework,
    filename: meta.filename ?? `spec.${ext}`,
    code,
  });
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

Return using this exact format:
===METADATA===
{"framework":"${framework}","filename":"<appropriate filename>"}
===CODE===
<full test source code>
===END===`;

  const raw = await provider.complete(SYSTEM_PROMPT, userPrompt);
  return parseTestWriterOutput(raw, framework);
}
