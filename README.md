# SpecSmith

> **SpecSmith finds what your team forgot to test.**

## One-Line Pitch

SpecSmith turns product specs and API docs into risk-ranked test plans and executable test drafts using a multi-agent QA pipeline designed for AMD MI300X.

---

## Brand Assets

- **Wordmark** (`public/brand/specsmith-wordmark.svg`) — SVG text-based wordmark used in the navbar and footer. This is the official navbar/logo asset.
- **Mascot** (`public/brand/specsmith-logo.png`) — The Smith mascot image. Used in the homepage hero, The Smith section, and the analyze page loading state. Not used as the navbar logo.

UI direction draws from three reference patterns:
- Atmospheric dark background with layered ambient glows (ehabhussein.com)
- Strong hero composition with split layout and proof structure (brandhousela.com)
- Clean premium navigation, section architecture, and footer (trajectorywebdesign.com)

---

## Problem

Developers and small teams accumulate test debt because writing test plans from specs is slow, tedious, and incomplete. Spec-to-test gaps cause production incidents that could have been caught before deployment.

Manual QA planning misses edge cases, ignores boundary conditions, and rarely accounts for abuse scenarios. The result: bugs in production that were obvious in hindsight.

---

## Solution

SpecSmith reads a product spec, PRD, GitHub issue, or OpenAPI document and runs a 5-agent QA pipeline:

1. **Spec Parser** — Extracts user stories, business rules, API endpoints, assumptions, and constraints
2. **Risk Mapper** — Flags ambiguous requirements, missing validations, edge cases, fragile flows, and abuse cases
3. **Test Planner** — Creates a structured test matrix across all test categories
4. **Test Writer** — Generates executable test drafts in Playwright, Jest, or Pytest
5. **QA Reviewer** — Reviews coverage, scores completeness, identifies gaps, and triggers revision if HIGH/CRITICAL risks are uncovered

The QA Reviewer includes a real feedback loop: if any HIGH or CRITICAL risk lacks test coverage, the pipeline re-runs the Test Planner and Test Writer for that risk before finalizing the report.

---

## Demo Flow

**Live demo**: https://specsmith.vercel.app/ (no account required, mock mode)

1. Open the homepage
2. Paste or load an example spec (Todo API, Checkout Flow PRD, or User Auth OpenAPI)
3. Select input type and test framework
4. Click **Forge Test Plan**
5. Watch the 5-agent pipeline execute with live progress
6. Review: risk registry, test matrix, generated test file, coverage score, gap report

---

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** + **Zod** for type safety and schema validation
- **Tailwind CSS** for styling
- **Provider abstraction**: mock / API / AMD mode
- **AMD MI300X** target for production inference (via vLLM + Qwen) — planned, see `docs/amd-setup.md`

---

## AMD / Qwen / ROCm Story

SpecSmith targets AMD MI300X GPUs via vLLM serving Qwen models through an OpenAI-compatible API.

Why this matters for QA:
- Long product specs and OpenAPI documents exceed the context windows of smaller models
- Qwen's strong instruction-following and code generation capabilities are well-suited for structured test generation
- AMD MI300X provides the memory bandwidth and VRAM capacity to serve large models efficiently for multi-agent inference

**Qwen validation**: `qwen/qwen-2.5-72b-instruct` was validated through OpenRouter using `PROVIDER=api`. The full 5-agent pipeline returned HTTP 200, generated 28 Playwright test cases, and scored 95/100 on the QA Reviewer — without any code changes. See [`docs/qwen-validation.md`](docs/qwen-validation.md) for the complete evidence record.

**AMD Developer Cloud status**: AMD mode is documented and ready to configure pending GPU credit allocation. See `docs/amd-setup.md`.

---

## Local Setup

```bash
git clone https://github.com/Storckmota/specsmith
cd specsmith
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys required in mock mode.

---

## Environment Variables

| Variable | Values | Description |
|---|---|---|
| `PROVIDER` | `mock` \| `api` \| `amd` | AI provider mode |
| `API_KEY` | `sk-...` | API key — **required** for `PROVIDER=api` |
| `API_BASE_URL` | URL | OpenAI-compatible base URL (default: `https://api.openai.com/v1`) |
| `API_MODEL` | e.g. `gpt-4o-mini` | Model name for API mode (default: `gpt-4o`; use `gpt-4o-mini` for cost-effective testing) |
| `AMD_ENDPOINT` | URL | vLLM endpoint for AMD mode |
| `AMD_MODEL` | e.g. `Qwen/Qwen2.5-72B-Instruct` | Model name for AMD mode |

Default: `PROVIDER=mock`. App works fully without any API keys.

> **Security**: Never commit `.env.local`. API keys are only read server-side and are never exposed to the browser.

> **Public deploy**: Use `PROVIDER=mock` for any public or uncontrolled deployment — it requires no API key and produces stable output. `PROVIDER=api` is for controlled local testing or a supervised demo only. See `docs/deployment.md`.

---

## Testing Provider Modes

### Mock mode (no keys required)

```bash
# .env.local
PROVIDER=mock
```

Works out of the box. Returns realistic fixture data through the full 5-agent pipeline. Best for local development and demos.

### API mode (OpenAI-compatible endpoint)

```bash
# .env.local
PROVIDER=api
API_KEY=sk-...
API_BASE_URL=https://api.openai.com/v1   # or any compatible endpoint
API_MODEL=gpt-4o
```

Any OpenAI-compatible provider works: OpenAI, Together AI, Fireworks, Groq, OpenRouter (Qwen), or a local vLLM instance.

If `API_KEY` is missing when `PROVIDER=api`, the app fails immediately with a clear error message.

### AMD mode (planned, not active yet)

```bash
# .env.local
PROVIDER=amd
AMD_ENDPOINT=http://<amd-cloud-ip>:8000
AMD_MODEL=Qwen/Qwen2.5-72B-Instruct
```

AMD mode calls a vLLM server running Qwen on AMD MI300X. The interface is identical to API mode. Configuration is documented in `docs/amd-setup.md`. AMD mode is not yet active in this build.

---

## Project Status

- [x] Repository scaffold
- [x] Mock pipeline (all 5 agents)
- [x] QA Reviewer feedback loop
- [x] Homepage UI
- [x] Analyze page UI
- [x] Zod schemas for output contract
- [x] API mode (OpenAI-compatible, robust with timeout + error surfacing)
- [x] Shared JSON extraction utility (handles markdown fences, leading prose)
- [x] Improved agent prompts for real model compatibility
- [x] Qwen validation — `qwen/qwen-2.5-72b-instruct` via OpenRouter, full pipeline, score 95/100
- [ ] AMD/Qwen mode (interface ready, endpoint not configured — pending GPU credits)
- [ ] AMD Developer Cloud proof

---

## Hackathon

**AMD Developer Hackathon** by lablab.ai
**Track**: AI Agents & Agentic Workflows
**Team**: SpecSmith PopLabs
