# SpecSmith

> **SpecSmith finds what your team forgot to test.**

## One-Line Pitch

SpecSmith turns product specs and API docs into risk-ranked test plans and executable test drafts using a multi-agent QA pipeline running on AMD MI300X.

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

1. Open the homepage
2. Paste or load an example spec (Todo API, Checkout Flow PRD, or User Auth OpenAPI)
3. Select input type and test framework
4. Click **Analyze**
5. Watch the 5-agent pipeline execute with live progress
6. Review: risk registry, test matrix, generated test file, coverage score, gap report

---

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** + **Zod** for type safety and schema validation
- **Tailwind CSS** for styling
- **Provider abstraction**: mock / API / AMD mode
- **AMD MI300X** for production inference (via vLLM + Qwen)

---

## AMD / Qwen / ROCm Story

SpecSmith targets AMD MI300X GPUs via vLLM serving Qwen models through an OpenAI-compatible API.

Why this matters for QA:
- Long product specs and OpenAPI documents exceed the context windows of smaller models
- Qwen's strong instruction-following and code generation capabilities are well-suited for structured test generation
- AMD MI300X provides the memory bandwidth and VRAM capacity to serve large models efficiently for multi-agent inference

**Current status**: AMD mode is documented and ready to configure. See `docs/amd-setup.md` for the integration checklist.

---

## Local Setup

```bash
git clone <repo>
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
| `API_MODEL` | e.g. `gpt-4o` | Model name for API mode |
| `API_BASE_URL` | URL | OpenAI-compatible base URL |
| `API_KEY` | string | API key for API mode |
| `AMD_ENDPOINT` | URL | vLLM endpoint for AMD mode |
| `AMD_MODEL` | e.g. `Qwen/Qwen2.5-72B-Instruct` | Model name for AMD mode |

Default: `PROVIDER=mock`. App works fully without any API keys.

---

## Project Status

- [x] Repository scaffold
- [x] Mock pipeline (all 5 agents)
- [x] QA Reviewer feedback loop
- [x] Homepage UI
- [x] Analyze page UI
- [x] Zod schemas for output contract
- [ ] API mode (OpenAI-compatible)
- [ ] AMD/Qwen mode
- [ ] AMD Developer Cloud proof

---

## Hackathon

**AMD Developer Hackathon** by lablab.ai
**Track**: AI Agents & Agentic Workflows
**Team**: SpecSmith PopLabs
