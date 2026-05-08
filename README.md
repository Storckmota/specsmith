# SpecSmith

SpecSmith is an agentic QA system that finds what your team forgot to test. Give it a product spec, PRD, GitHub issue, or OpenAPI document and it runs a structured 5-agent pipeline that returns a risk-ranked test plan, an executable test draft, a coverage score, and a gap report — with no manual QA planning required.

| | |
|---|---|
| **Live Demo** | https://specsmith.vercel.app/ |
| **GitHub** | https://github.com/Storckmota/specsmith |
| **Submission Kit** | [docs/submission-kit.md](docs/submission-kit.md) |
| **Qwen Validation** | [docs/qwen-validation.md](docs/qwen-validation.md) |
| **Deployment Guide** | [docs/deployment.md](docs/deployment.md) |

---

## Why SpecSmith

Teams ship software from PRDs, GitHub issues, and OpenAPI documents — but test planning is a manual step that gets skipped, rushed, or siloed. High-risk flows get missed. Edge cases go untested. Abuse scenarios never make it into the plan. The result is bugs in production that were obvious in hindsight.

SpecSmith closes that gap by treating spec-to-test conversion as an agentic workflow:

- **Risk-ranked findings** — every identified risk has a severity (LOW / MEDIUM / HIGH / CRITICAL) and a "why it matters" explanation
- **Structured test matrix** — test cases across happy path, edge case, negative case, regression, API validation, and abuse case categories
- **Executable test drafts** — real Playwright, Jest, or Pytest code with given/when/then structure, not pseudocode
- **Coverage score** — 0–100 score with explicit gap identification
- **Gap report** — named, actionable list of what is not covered and why

SpecSmith is not a test generator. It is an agentic QA workflow — five agents with defined roles, schema-validated handoffs, and a deterministic feedback loop.

---

## Demo

**Live demo**: https://specsmith.vercel.app/ — no account required.

The public demo runs in `PROVIDER=mock` mode: deterministic, no API keys, no external calls. It demonstrates the complete UX and 5-agent pipeline without any auth wall or cost. Controlled API validation (real model output) has been confirmed locally with `gpt-4o-mini` and `qwen/qwen-2.5-72b-instruct`.

**Demo flow:**

1. Open https://specsmith.vercel.app/
2. Click **Todo API Spec** or **User Auth OpenAPI** to load an example
3. Select input type and framework (Playwright / Jest / Pytest)
4. Click **Forge Test Plan →**
5. Review the Forge Report — risk registry, test matrix, generated test file, coverage score, gap report

---

## Agent Workflow

```
User Spec
  ↓
[1] Spec Parser     — normalizes any input into structured ParsedSpec
  ↓
[2] Risk Mapper     — ranks risks by severity with source refs
  ↓
[3] Test Planner    — builds test matrix, all 6 categories, HIGH/CRITICAL risks covered
  ↓
[4] Test Writer     — generates executable Playwright / Jest / Pytest code
  ↓
[5] QA Reviewer     — deterministic coverage check; triggers revision if gaps found
  ↳ optional revision loop → back to Test Planner + Test Writer (max once)
  ↓
Forge Report
```

**Agent details:**

1. **Spec Parser** — Accepts PRD, OpenAPI YAML/JSON, GitHub issue, or plain spec. Extracts user stories, business rules, API endpoints, assumptions, and constraints into a typed `ParsedSpec` structure.

2. **Risk Mapper** — Reads the `ParsedSpec` and produces a `RiskItem[]` registry. Each risk has an ID (`R-001` format), severity, source reference, and a "why it matters" field.

3. **Test Planner** — Builds `TestCase[]` covering all six test categories. Every HIGH and CRITICAL risk must have at least one linked test case ID. Each test case has a given/when/then structure.

4. **Test Writer** — Generates a complete test file using a `===METADATA=== / ===CODE=== / ===END===` delimiter format so generated source code is never subject to JSON string escaping failures. Includes one automatic retry if the model does not follow the format.

5. **QA Reviewer** — Deterministic code, not an LLM call. Checks every HIGH/CRITICAL risk for `linkedTestIds` coverage. If any are uncovered, sets `plannerRevised: true` and signals the pipeline to re-run the Test Planner and Test Writer for those specific risk IDs. Maximum one revision pass.

**Duplicate request protection**: a SHA-256 fingerprint of each request deduplicates concurrent identical submissions, so accidental double-clicks or repeated API calls do not trigger multiple pipeline runs.

---

## Validation Status

| Mode | Status | Notes |
|---|---|---|
| `mock` | ✅ Public demo | Safe Vercel deployment, no API keys |
| `api` / gpt-4o-mini | ✅ Validated | Controlled local/provider test |
| `api` / Qwen 2.5 72B | ✅ Validated | OpenRouter OpenAI-compatible path |
| `amd` / vLLM / Qwen | 🟡 Planned | Pending AMD Developer Cloud credits |

The `amd` provider path is present and documented, but not live. No AMD Developer Cloud runtime has been configured — AMD mode is pending GPU credit allocation.

---

## Qwen Validation

SpecSmith was validated with `qwen/qwen-2.5-72b-instruct` through OpenRouter using the same `PROVIDER=api` OpenAI-compatible path — no code changes were required.

**Result**: The full 5-agent workflow completed on the User Auth OpenAPI example. HTTP 200, all five agents returned schema-valid output, 28 Playwright test cases generated, QA Reviewer score **95/100**.

Full evidence: [docs/qwen-validation.md](docs/qwen-validation.md)

---

## AMD Developer Cloud Path

SpecSmith was designed so the provider layer can point to a vLLM endpoint running Qwen on AMD Developer Cloud / MI300X. The architecture is identical to `PROVIDER=api` — the only change is the endpoint and model name.

- AMD Developer Cloud GPU credits have been requested and are pending
- `docs/amd-setup.md` documents the intended integration path
- The `AmdProvider` class and `AMD_ENDPOINT` / `AMD_MODEL` environment variables are implemented
- The current public demo does not run on AMD Developer Cloud hardware
- Qwen model readiness is confirmed by the OpenRouter validation above

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Schema validation | Zod v4 — strict enum validation with case normalization preprocessing |
| AI provider abstraction | OpenAI-compatible chat completions interface |
| Provider modes | `mock` (fixtures), `api` (any OpenAI-compatible endpoint), `amd` (planned) |
| Validated models | gpt-4o-mini (OpenAI), qwen/qwen-2.5-72b-instruct (OpenRouter) |
| Deployment | Vercel — `PROVIDER=mock`, no API keys in environment |
| Planned inference | AMD Developer Cloud + vLLM + Qwen on MI300X |

---

## Architecture

```
User Spec
  ↓
Spec Parser
  ↓
Risk Mapper
  ↓
Test Planner
  ↓
Test Writer
  ↓
QA Reviewer
  ↳ optional revision loop
  ↓
Forge Report
```

**Provider modes:**

| Mode | How it works |
|---|---|
| `PROVIDER=mock` | Returns deterministic fixture data through all five agents. No API key required. |
| `PROVIDER=api` | Calls any OpenAI-compatible `/chat/completions` endpoint. Requires `API_KEY`. |
| `PROVIDER=amd` | Designed to call a configured vLLM endpoint running Qwen on AMD Developer Cloud. Same interface as API mode. |

---

## Local Setup

```bash
git clone https://github.com/Storckmota/specsmith
cd specsmith
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

- Default is `PROVIDER=mock` — works with no API keys
- For API validation, edit `.env.local` with your provider settings
- **Never commit `.env.local`** — it is already in `.gitignore`

---

## Environment Variables

Mock mode (default — no keys required):

```bash
PROVIDER=mock
```

Controlled API demo with Qwen via OpenRouter:

```bash
PROVIDER=api
API_BASE_URL=https://openrouter.ai/api/v1
API_MODEL=qwen/qwen-2.5-72b-instruct
API_KEY=your_key_here
```

See `.env.example` for all available variables. API keys are read server-side only and are never exposed to the browser.

---

## Deployment

- Public deployments must use `PROVIDER=mock` — no API key, no cost, stable output
- Do not deploy with `PROVIDER=api` on a public endpoint without authentication and rate limiting
- See [docs/deployment.md](docs/deployment.md) for the full deployment safety guide

---

## Repository Docs

| Document | Purpose |
|---|---|
| [docs/submission-kit.md](docs/submission-kit.md) | Full hackathon submission kit — pitch, agent workflow, video script, screenshot checklist |
| [docs/qwen-validation.md](docs/qwen-validation.md) | Qwen validation evidence — provider config, pipeline results, coverage score |
| [docs/provider-readiness-audit.md](docs/provider-readiness-audit.md) | Provider mode readiness audit |
| [docs/deployment.md](docs/deployment.md) | Safe deployment guide |
| [docs/amd-setup.md](docs/amd-setup.md) | AMD Developer Cloud integration path |
| [docs/design-strategy.md](docs/design-strategy.md) | UI and product design notes |

---

## Final Submission Notes

- **Public demo** runs in `PROVIDER=mock` — safe, deterministic, no secrets
- **Controlled API validation** confirmed with `gpt-4o-mini` (OpenAI) and `qwen/qwen-2.5-72b-instruct` (OpenRouter)
- **Qwen validation evidence** documented in `docs/qwen-validation.md`
- **AMD mode** is planned and documented — not live, pending GPU credit allocation
- **No secrets committed** — `.env.local` is gitignored, `.env.example` contains placeholders only

---

**AMD Developer Hackathon** by lablab.ai · Track: AI Agents & Agentic Workflows · Team: SpecSmith PopLabs
