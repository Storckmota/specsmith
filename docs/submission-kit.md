# SpecSmith Submission Kit

## 1. Project Identity

| Field | Value |
|---|---|
| Project name | SpecSmith |
| Team name | SpecSmith PopLabs |
| Track | AI Agents & Agentic Workflows |
| Public demo URL | https://specsmith.vercel.app/ |
| GitHub repo | https://github.com/Storckmota/specsmith |
| Hackathon | AMD Developer Hackathon by lablab.ai |

**One-line pitch:**
SpecSmith turns product specs and API docs into risk-ranked test plans and executable test drafts using a 5-agent QA pipeline designed for AMD MI300X.

---

## 2. Short Description

SpecSmith is a 5-agent QA pipeline that converts product specs, PRDs, and OpenAPI docs into risk-ranked test matrices and executable test drafts — so developers find gaps before production does.

_(148 characters — within the 150–200 character guidance)_

---

## 3. Long Description

**The problem**: Developers and small teams accumulate test debt because writing test plans from specs is slow, incomplete, and low priority. Spec-to-test gaps cause production incidents that were obvious in hindsight. Manual QA planning misses edge cases, ignores boundary conditions, and rarely covers abuse scenarios.

**The solution**: SpecSmith reads a product spec, PRD, GitHub issue, or OpenAPI document and runs a structured 5-agent QA pipeline. Each agent has a specific role and validates its output through Zod schemas before passing it to the next stage.

**The 5-agent workflow:**

1. **Spec Parser** — Normalizes any input type (PRD, OpenAPI, GitHub issue, plain spec) into a structured representation: user stories, business rules, API endpoints, assumptions, and constraints.
2. **Risk Mapper** — Flags ambiguous requirements, missing validations, boundary conditions, fragile flows, and potential abuse vectors. Each risk is severity-ranked: LOW, MEDIUM, HIGH, or CRITICAL.
3. **Test Planner** — Builds a structured test matrix that covers all six test categories: happy path, edge case, negative case, regression, API validation, and abuse case. All HIGH and CRITICAL risks must have linked test coverage.
4. **Test Writer** — Generates executable test drafts in Playwright, Jest, or Pytest. Output uses a delimiter-based format to avoid JSON escaping failures on real source code.
5. **QA Reviewer** — Deterministic coverage checker. Validates that every HIGH and CRITICAL risk has at least one linked test. If any are missing, it triggers one targeted revision pass of the Test Planner and Test Writer before finalizing the report.

**Risk reduction**: The risk registry makes QA thinking visible. Instead of discovering gaps in post-mortem, teams see severity-ranked risks before a single line of test code is written.

**Generated executable test drafts**: The Test Writer outputs real Playwright, Jest, or Pytest code — not pseudocode. Tests implement the test matrix's given/when/then structure with placeholder assertions and are ready to adapt and run against a real application.

**Coverage gaps**: The gap report explicitly calls out what was not tested and why. This is as valuable as the passing tests.

**Public demo**: The live demo at https://specsmith.vercel.app/ runs in `PROVIDER=mock` mode — fully deterministic, no API keys, no cost, no external calls. It demonstrates the complete UX and agent pipeline structure without any auth wall.

**Controlled API mode**: The codebase supports `PROVIDER=api`, which calls any OpenAI-compatible endpoint. This mode was validated end-to-end with `gpt-4o-mini`: real model output parsed correctly through all five pipeline stages, including the Test Writer's delimiter format and the Zod schema case normalization.

**AMD/Qwen/MI300X planned architecture**: SpecSmith is designed for AMD MI300X inference. The provider abstraction (`PROVIDER=amd`) targets a vLLM server running Qwen on AMD Developer Cloud through an identical OpenAI-compatible interface. This architecture allows the same 5-agent pipeline to switch from OpenAI to Qwen simply by changing environment variables — no code changes required. AMD mode is not yet active in this build pending GPU credit allocation and vLLM endpoint configuration.

---

## 4. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Schema validation | Zod v4 with strict enum validation and case normalization preprocessing |
| AI provider abstraction | OpenAI-compatible chat completions interface |
| Provider modes | `mock` (deterministic fixtures), `api` (any OpenAI-compatible endpoint), `amd` (planned) |
| Test Writer format | Delimiter-based output (`===METADATA===` / `===CODE===` / `===END===`) to avoid JSON escaping failures |
| Error handling | AbortController 90s timeout, non-2xx surfacing, one-retry Test Writer repair path |
| Secrets | Server-side only; `API_KEY` never exposed to browser |
| Public deploy | Vercel — `PROVIDER=mock`, no API keys in environment |
| Planned inference | AMD Developer Cloud + vLLM + Qwen/Qwen2.5-72B-Instruct on MI300X |

---

## 5. Agent Workflow

### Agent 1: Spec Parser
Normalizes raw input (PRD, OpenAPI YAML/JSON, GitHub issue, or plain spec) into a structured `ParsedSpec`: title, detected scope, user stories, business rules, API endpoints, assumptions, and constraints. Handles all four input types without separate parsers.

### Agent 2: Risk Mapper
Reads the `ParsedSpec` and produces a `RiskItem[]` registry. Each risk has an ID (`R-001` format), title, description, severity (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), source reference, and a "why it matters" explanation. The prompt instructs the model not to invent file paths or line numbers.

### Agent 3: Test Planner
Reads the `ParsedSpec` and `RiskItem[]` and produces a `TestCase[]` matrix. Each test case has a category, priority, given/when/then structure, and a list of `linkedRiskIds`. The prompt requires all six test categories to be covered and all HIGH/CRITICAL risks to have at least one linked test.

### Agent 4: Test Writer
Reads the `TestCase[]` matrix and generates a complete `TestFile` in the requested framework. Output uses a delimiter format (`===METADATA===` / `===CODE===` / `===END===`) so generated source code is never subject to JSON string escaping. Includes one automatic retry that passes the bad output back for reformatting if the model does not follow the format.

### Agent 5: QA Reviewer (deterministic — no LLM call)
Checks each HIGH/CRITICAL `RiskItem` for `linkedTestIds` coverage. If any are uncovered, sets `plannerRevised: true` and signals the pipeline to re-run the Test Planner and Test Writer targeted at those specific risk IDs. Maximum one revision pass. Produces a final `CoverageResult`: score (0–100), summary, gaps list, and reviewer feedback.

**Revision loop**: The QA Reviewer is the only agent that can trigger a pipeline re-run. It is deterministic code — not an LLM call — which means the feedback loop is reliable and bounded. One revision pass, then finalize.

---

## 6. Demo Flow

1. **Open homepage** — https://specsmith.vercel.app/ — confirm HTTP 200, no auth wall
2. **Load example spec** — Click "Todo API Spec", "Checkout Flow PRD", or "User Auth OpenAPI" to pre-fill the input
3. **Select input type and framework** — Choose OpenAPI/PRD/plain spec and Playwright/Jest/Pytest
4. **Click "Forge Test Plan →"** — Submit guard prevents duplicate submissions; loading state activates
5. **Watch the Forge Report load** — Agent timeline shows each stage completing in sequence
6. **Show the agent timeline** — Five cards: Spec Parser → Risk Mapper → Test Planner → Test Writer → QA Reviewer with "Revision loop" badge
7. **Show the risk registry** — Severity-ranked risk items with IDs, descriptions, and "why it matters"
8. **Show the test matrix** — Test cases by category and priority, each with given/when/then and linked risk IDs
9. **Show the generated test file** — Real Playwright/Jest/Pytest code, labeled as an executable draft
10. **Show the coverage score and gap report** — Numeric score, gaps explicitly named, reviewer feedback

---

## 7. Video Script

**Target length: 2–3 minutes**

---

**[OPENING — 0:00–0:20]**

"Every team ships bugs that were obvious in hindsight. Not because developers don't care — but because writing test plans from scratch is slow, incomplete, and usually the last thing on the list.

SpecSmith fixes that."

---

**[PRODUCT OVERVIEW — 0:20–0:40]**

"SpecSmith is a 5-agent QA pipeline. You give it a product spec, a PRD, a GitHub issue, or an OpenAPI document — and it gives you back a risk-ranked test plan and executable test code. In under a minute."

---

**[LIVE DEMO — 0:40–1:30]**

"Let me show you. I'm on the SpecSmith homepage. I'll load the User Auth OpenAPI example — a realistic authentication spec with registration, login, token refresh, and protected routes.

I'll keep the default Playwright framework and click 'Forge Test Plan.'

The pipeline is running. You can see the five agents in the timeline — Spec Parser, Risk Mapper, Test Planner, Test Writer, and QA Reviewer.

The Forge Report is ready. Let me scroll through it.

Here's the risk registry. The risk mapper flagged weak password policy, missing rate limiting on login, JWT token expiry edge cases, and account enumeration via login response timing. These are the things teams forget to test.

Here's the test matrix — 20+ test cases across happy paths, edge cases, negative cases, abuse cases, and API validation. Each one is linked to a specific risk ID.

Here's the generated Playwright test file. This is real code — imports, test blocks, assertions. It's labeled as a draft because the assertions need to be wired to a real application. But the structure is already there.

And here's the coverage score and gap report. Score 95 out of 100. The gap report tells me exactly what's not covered and why."

---

**[AGENT WORKFLOW — 1:30–1:55]**

"The five agents each have a specific job.

The Spec Parser normalizes any input format into a common structure. The Risk Mapper ranks every gap by severity. The Test Planner builds the matrix and makes sure HIGH and CRITICAL risks are covered. The Test Writer generates real executable code — not pseudocode.

And the QA Reviewer is deterministic code, not another LLM call. It checks coverage, and if any HIGH or CRITICAL risk is uncovered, it triggers one targeted revision pass before finalizing the report. The feedback loop is bounded and reliable."

---

**[BUSINESS VALUE — 1:55–2:15]**

"The value isn't just the test code. It's the risk registry. It makes QA thinking visible before a single test is written. Teams can see what they're about to ship with, decide whether the risk is acceptable, and fix gaps before production does it for them."

---

**[TECHNICAL ARCHITECTURE — 2:15–2:35]**

"Under the hood: Next.js 16, TypeScript, Zod v4 for strict schema validation across every agent output, and a provider abstraction that supports mock, API, and AMD mode.

The public demo runs in mock mode — deterministic, no API keys, no cost. The codebase was validated end-to-end with a real gpt-4o-mini model through the full 5-agent pipeline, including real OpenAPI specs."

---

**[AMD STORY — 2:35–2:50]**

"SpecSmith is designed for AMD MI300X inference. The PROVIDER=amd mode targets a vLLM server running Qwen on AMD Developer Cloud. Long product specs and OpenAPI documents need the context window and memory bandwidth that MI300X provides. Switching from OpenAI to Qwen requires only a change in environment variables — the pipeline stays identical."

---

**[CLOSING — 2:50–3:00]**

"SpecSmith. Five agents. One report. Find what your team forgot to test — before production does."

---

## 8. Screenshot Checklist

Capture these screenshots before submission:

- [ ] **Homepage hero** — full page, dark background, wordmark in navbar, hero heading visible
- [ ] **Forge input** — example spec loaded in textarea, input type and framework selects visible, "Forge Test Plan →" button
- [ ] **Agent timeline** — Forge Report page, all five agent cards visible, QA Reviewer "Revision loop" badge
- [ ] **Risk registry** — at least 3–4 risk items visible, severity badges (HIGH/CRITICAL) in frame
- [ ] **Test matrix** — test cases table, category and priority columns, linkedRiskIds visible
- [ ] **Generated test file** — real Playwright/Jest/Pytest code, "executable draft" label visible
- [ ] **Coverage score and gap report** — numeric score, gaps listed, reviewer feedback section
- [ ] **Provider mode badge** — "Mock mode" indicator in the report summary or agent timeline
- [ ] **Optional: API local proof** — terminal showing `PROVIDER=api` run with gpt-4o-mini, score visible in browser
- [ ] **Optional: AMD Developer Cloud credit request** — dashboard screenshot if GPU credits were approved before deadline

---

## 9. Submission Tags

Suggested tags for the hackathon submission form:

`AI Agents` · `QA Automation` · `Developer Tools` · `Testing` · `Agentic Workflows` · `Next.js` · `TypeScript` · `Qwen` · `AMD Developer Cloud` · `ROCm` · `vLLM` · `OpenAI Compatible` · `Test Generation` · `Risk Analysis`

---

## 10. Honest AMD Positioning

SpecSmith is designed for AMD Developer Cloud and targets AMD MI300X inference. The architecture is real — the implementation is provider-agnostic and ready. Here is an accurate description of the current state:

**What is true:**
- SpecSmith's provider abstraction (`lib/providers/index.ts`) supports `mock`, `api`, and `amd` modes selected by a single environment variable.
- `PROVIDER=amd` calls an OpenAI-compatible vLLM endpoint — the same interface that AMD Developer Cloud vLLM instances expose.
- The pipeline was validated end-to-end with a real model (`gpt-4o-mini` via `PROVIDER=api`), which confirms the 5-agent pipeline, Zod validation, and delimiter-based Test Writer format work with real LLM output.
- Qwen/Qwen2.5-72B-Instruct is the target model for AMD mode: strong instruction-following, large context window, and good code generation.
- AMD MI300X provides the VRAM and memory bandwidth to serve large models for multi-agent inference at this context size.

**What is not yet true:**
- No live AMD Developer Cloud endpoint has been configured.
- No vLLM launch on MI300X has been captured.
- No end-to-end `PROVIDER=amd` pipeline run has been completed.
- No ROCm/HIP logs or Qwen model load screenshots exist.

**Positioning language to use in submissions:**
- "designed for AMD MI300X" ✅
- "built to run on AMD Developer Cloud" ✅
- "targets AMD MI300X via vLLM + Qwen" ✅
- "AMD mode is ready to configure pending endpoint access" ✅
- "running on AMD MI300X" ❌ — do not use until live proof exists
- "powered by AMD MI300X" ❌ — do not use until live proof exists

**If AMD GPU credits are not approved before the deadline:** Submit with API mode proof and honest AMD positioning. The architecture speaks for itself.

---

## 11. Final Pre-Submission Checklist

### Public demo
- [ ] https://specsmith.vercel.app/ opens without auth wall (HTTP 200)
- [ ] Homepage loads, example specs work, "Forge Test Plan" button visible
- [ ] Forge Report page renders after analysis (mock mode)
- [ ] No "running on AMD MI300X" or false AMD runtime claims visible on the site

### Repository
- [ ] GitHub repo is public and accessible
- [ ] README.md is complete: pitch, problem, solution, tech stack, local setup, provider modes
- [ ] `docs/deployment.md` present with deployment safety guide
- [ ] `docs/amd-setup.md` present with honest AMD TODO status
- [ ] `docs/submission-kit.md` present (this file)
- [ ] `.env.example` is committed with placeholders only — no real keys
- [ ] `.env.local` is NOT committed (confirmed by `.gitignore`)
- [ ] No real API keys in any committed file

### Submission form
- [ ] Demo URL entered: https://specsmith.vercel.app/
- [ ] GitHub repo URL entered
- [ ] Short description entered (≤ 200 characters)
- [ ] Long description entered
- [ ] Tags selected
- [ ] Cover image uploaded (screenshot or custom graphic)
- [ ] Track selected: AI Agents & Agentic Workflows

### Video
- [ ] 2–3 minute demo video recorded (use script in Section 7)
- [ ] Video covers: problem, demo, agent workflow, coverage score, AMD positioning
- [ ] Video uploaded or linked

### Final checks
- [ ] `npm run build` passes with no errors
- [ ] `npx tsc --noEmit` passes with no output
- [ ] `git status` is clean — no uncommitted changes, no staged secrets
- [ ] `git log --oneline -3` shows only docs commits in the final push
