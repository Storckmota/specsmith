# SpecSmith Provider Readiness Audit

## 1. Executive Verdict

**Ready for PROVIDER=api: Ready with minor fixes.**

The API provider path is implemented, server-side, OpenAI-compatible, validated through the same 5-agent pipeline, and the production build passes. The remaining fixes are not architectural blockers: tighten JSON extraction for trailing prose, document prompt-injection limits, and run one real provider smoke test with `PROVIDER=api`.

**Ready for AMD/Qwen planning: Yes.**

**Not ready for AMD/Qwen implementation yet: Yes.**

AMD mode has a structural provider placeholder and honest setup documentation, but no Developer Cloud endpoint, vLLM launch proof, ROCm/Qwen logs, auth handling, timeout handling, or end-to-end AMD test has been captured.

## 2. Current Architecture Check

- **Provider abstraction:** Coherent. `lib/providers/index.ts` selects `mock`, `api`, or `amd` at runtime from `PROVIDER` and returns both provider instance and display mode.
- **Mock provider:** Works as a deterministic fixture provider for the full pipeline. It is good enough for demo stability, though it routes by prompt substring, so it is intentionally not a production model substitute.
- **API provider:** Implemented in `lib/providers/api-provider.ts` using `/chat/completions`, `API_BASE_URL`, `API_MODEL`, `API_KEY`, temperature `0`, and a 90s abort timeout.
- **AMD provider placeholder:** Structurally present in `lib/providers/amd-provider.ts`, but less robust than API mode. It lacks timeout handling, optional auth headers, endpoint slash normalization, and rich error-body surfacing.
- **Agent pipeline:** Coherent. `lib/agents/pipeline.ts` runs parser -> risk mapper -> planner -> writer -> deterministic reviewer, then performs one revision pass if HIGH/CRITICAL risks are uncovered.
- **Schema validation:** Zod validates request and all agent outputs. Enums are strict enough to catch invalid categories, severities, frameworks, and input types.
- **JSON extraction:** Shared extraction exists and handles raw JSON, fenced JSON, and leading prose. It does not yet recover from trailing prose after the JSON value.
- **Frontend/report flow:** Homepage calls `/api/analyze`, stores result in `sessionStorage`, and `/analyze` renders a complete report. This is acceptable for MVP and mock/API demo mode.
- **Error handling:** API route returns 400 for invalid input and 500 for pipeline/provider failures. UI displays the error on the homepage. Real-provider failures are surfaced clearly enough for local testing.

## 3. API Provider Readiness

- `PROVIDER=api` uses env vars correctly: `API_KEY`, `API_BASE_URL`, and `API_MODEL`.
- `API_KEY` stays server-side. It is only read in `lib/providers/api-provider.ts`; client code does not reference it.
- `API_BASE_URL` supports OpenAI-compatible APIs by trimming a trailing slash and calling `${baseUrl}/chat/completions`.
- Timeout handling is good enough for Phase 3: `AbortController` aborts after 90 seconds.
- Error handling is good enough for Phase 3: non-2xx responses include status and provider error message when parseable, without logging the key.
- Agents expect valid JSON and parse through `extractJson` before Zod validation.
- Zod validation is strict enough to reject shape drift without being too brittle for normal real-model outputs.
- Real LLM output can still fail if the model returns:
  - trailing commentary after a valid JSON object or array
  - smart quotes or unescaped newlines inside the `code` JSON string
  - lowercase enum values such as `high` or `playWright`
  - extra text around generated test code instead of a JSON string field
  - risk IDs or test IDs that are syntactically valid strings but semantically inconsistent

## 4. Agent Prompt Readiness

### Spec Parser

- Purpose is clear.
- Input and output are clear.
- Schema alignment is good.
- Hallucination risk is moderate because the prompt allows inferred stories and assumptions. That is acceptable for QA analysis if the UI treats them as model-derived.
- Invalid JSON risk is low to moderate; the prompt strongly says raw JSON only.

### Risk Mapper

- Purpose is clear.
- Input and output are clear.
- Schema alignment is good.
- Source reference handling is honest: it tells the model not to invent filenames or line numbers.
- Hallucination risk is moderate because risks can be inferred. This is core product behavior, but the output should remain framed as QA findings, not proven defects.
- `linkedTestIds` correctly starts empty here.

### Test Planner

- Purpose is clear.
- Input and output are clear.
- Schema alignment is good.
- The prompt explicitly requires all HIGH/CRITICAL risks to have linked tests and all six categories.
- Consistency risk remains: the model can generate `linkedRiskIds` that do not exist. Zod will not catch cross-reference validity.
- Revision prompt is appropriately narrow and asks only for new tests.

### Test Writer

- Purpose is clear.
- Input and output are clear.
- Schema alignment is good.
- Highest invalid JSON risk in the pipeline because executable code must be escaped inside a JSON string.
- The prompt correctly says the JSON itself must not be fenced and the `code` field may contain language syntax.
- Real generated tests should be treated as executable drafts, not guaranteed complete tests against a real app.

### QA Reviewer

- The implemented reviewer is deterministic code, not an LLM call. That is a strength for Phase 3 readiness.
- It honestly checks HIGH/CRITICAL risk coverage by `linkedRiskIds`.
- It does not inspect whether generated code actually implements each test beyond the matrix linkage.
- It sets `plannerRevised` correctly for one revision pass and prevents infinite loops.

## 5. UX Readiness

- Loading states exist on the homepage and `/analyze`.
- Empty `/analyze` state exists and routes users back to the Forge.
- Error state exists on homepage analysis failure.
- Generated test file explanation is clear: it calls the output an executable draft and tells users to review/adapt/run it.
- Provider mode display exists in the report summary and agent timeline.
- Report readability is strong: summary, score, timeline, gaps, risk registry, matrix, and test file are separated clearly.
- No fake runtime metrics were found in the report flow.
- UX caveat: homepage copy includes “AMD MI300X Ready” and “designed for AMD MI300X.” That is less risky than claiming live AMD execution, but should be softened until AMD proof is captured.
- README caveat: the one-line pitch says the pipeline is “running on AMD MI300X,” which is not currently true and should be fixed before public submission.

## 6. Security / Secrets Check

- `.env.local` is ignored via `.env*` with `!.env.example`.
- Only `.env.example` exists in the workspace; no local env file was found.
- `.env.example` is safe and contains placeholders only.
- API keys are not exposed to browser code.
- Targeted scan of app/lib/components/docs/agents/examples found no committed real API keys.
- No console logging of API keys was found.
- API provider error handling does not include request headers or key values.
- Prompt injection considerations are not documented. This is not a Phase 3 blocker, but the docs should state that user specs are untrusted input and generated tests/reports require review.

## 7. AMD/Qwen Readiness

- `amd-provider.ts` is structurally ready in the sense that it implements the same `AiProvider` interface and calls a vLLM-style OpenAI-compatible chat endpoint.
- It is not operationally ready: no timeout, no endpoint slash normalization, no optional bearer/API key support, no error-body extraction, no model compatibility notes, and no tested endpoint.
- `docs/amd-setup.md` contains honest TODOs and clearly marks the vLLM command as unverified.
- README mostly avoids claiming active AMD mode, but the opening pitch currently overclaims “running on AMD MI300X.”
- Missing before AMD/Qwen/vLLM wiring:
  - AMD Developer Cloud access
  - running MI300X instance
  - ROCm-compatible vLLM launch command
  - selected Qwen model and memory/concurrency notes
  - network/auth configuration for the vLLM endpoint
  - end-to-end `PROVIDER=amd` pipeline run
  - logs/screenshots proving ROCm/HIP device use and model response
- Hackathon proof to capture:
  - AMD Developer Cloud dashboard screenshot
  - vLLM startup logs showing ROCm/HIP and model load
  - curl request to `/v1/chat/completions`
  - SpecSmith UI report showing `AMD/Qwen mode`
  - terminal log for a complete pipeline run

## 8. Blockers

### Critical blockers

None found that must be fixed before a controlled `PROVIDER=api` smoke test.

### Important but not blocking

- Run a real OpenAI-compatible provider smoke test and record the result.
- Improve `extractJson` to recover from trailing prose after the first valid JSON value.
- Add semantic validation for cross-references: `linkedRiskIds` must exist, and HIGH/CRITICAL risks should be covered after planner output before writer execution.
- Fix public copy that overclaims AMD runtime status, especially README’s “running on AMD MI300X.”
- Document prompt-injection and generated-test trust boundaries.
- Harden `AmdProvider` to match `ApiProvider` timeout and error behavior before any AMD run.

### Nice-to-have

- Add a local script for typecheck, for example `npm run typecheck`.
- Add unit tests for `extractJson`.
- Add a provider smoke-test script that checks `/chat/completions` before running the whole pipeline.
- Add model response fixtures for common malformed JSON cases.

## 9. Minimal Fix Plan

- Fix 1: Update README/homepage wording so the project says “built for” or “designed for” AMD MI300X, not “running on” AMD MI300X, until proof exists.
- Fix 2: Add trailing-prose recovery to `extractJson` and test it with object, array, fenced, leading-prose, and trailing-prose examples.
- Fix 3: Run one `PROVIDER=api` end-to-end smoke test with a real OpenAI-compatible endpoint and capture the model, provider, command, and result.

## 10. Recommended Next Step

**Proceed to PROVIDER=api test after the README overclaim is corrected.**

Do not pause for AMD Developer Cloud yet. API mode is the right Phase 3 bridge: it will expose real-model JSON and prompt issues before AMD/vLLM variables are added.

## Validation

- `npm run build` result: Passed after allowing network access for Next font fetches. Initial sandboxed run failed because `next/font` could not fetch Geist and Geist Mono from Google Fonts.
- `npx tsc --noEmit` result: Passed with no output.
- `git status --short`: initially clean before this audit document was created.
- `git diff --stat`: one new audit document after creation.
- Audit verdict: Ready with minor fixes for `PROVIDER=api`; ready for AMD/Qwen planning; not ready for AMD/Qwen implementation yet.
- `git log --oneline -7`:
  - `2f07b41 docs: update design strategy and task status`
  - `fca2e57 fix: handle empty forge report and align select controls`
  - `1b4bf1a fix: clarify generated test output and polish forge report motion`
  - `3fb1ec7 fix: clean navbar and timeline overlap`
  - `83e1eb4 fix: refine visual system and responsiveness`
  - `fb8c8bb fix: apply approved SpecSmith logo asset`
  - `ddde02f feat: make API provider mode robust`

## 11. Deployment Safety

- Default to `PROVIDER=mock` for any public or uncontrolled deployment. Mock mode requires no API key and produces stable, deterministic output.
- `PROVIDER=api` uses a server-side API key (`API_KEY` in `.env.local`). Never expose `.env.local` or commit it to version control.
- Use `API_MODEL=gpt-4o-mini` for validation and low-cost testing. Switch to a stronger model only for a final controlled demo if output quality requires it.
- Set `DEBUG_AGENT_OUTPUT=true` locally to include model output previews in parse error messages. Leave it unset in production — parse errors return generic messages with no raw model content.
- `PROVIDER=api` smoke test passed with `gpt-4o-mini` (commit `28f4f00`). Two schema fixes were required: case normalization on `PrioritySchema` / `SeveritySchema`, and a delimiter-based output format for the Test Writer to avoid JSON escaping failures in generated code.
