# ARCHITECTURE.md — SpecSmith System Architecture

## Overview

SpecSmith is a Next.js 16 application with App Router. The core product is a 5-agent pipeline that runs server-side via a single API route. The frontend renders the pipeline output in a structured UI.

---

## Provider Abstraction

The pipeline calls AI via a provider abstraction layer that supports three modes:

```
PROVIDER=mock    → MockProvider (returns hardcoded fixtures)
PROVIDER=api     → ApiProvider (calls OpenAI-compatible API)
PROVIDER=amd     → AmdProvider (calls vLLM on AMD Developer Cloud)
```

All providers implement the same interface:

```typescript
interface AiProvider {
  complete(systemPrompt: string, userPrompt: string): Promise<string>
}
```

The pipeline imports `getProvider()` from `lib/providers/index.ts`. The provider is selected at runtime from the `PROVIDER` environment variable.

---

## API Contract

### POST /api/analyze

**Request**:
```json
{
  "specText": "string",
  "inputType": "prd | openapi | github_issue | plain_spec",
  "framework": "playwright | jest | pytest"
}
```

**Response**: `AnalysisResult` (see SPEC.md for full schema)

**Error responses**:
- `400` — Missing or invalid request body
- `500` — Pipeline execution error

---

## Agent Data Flow

```
User Input (specText, inputType, framework)
        │
        ▼
┌─────────────────┐
│  Spec Parser    │ → ParsedSpec
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Risk Mapper    │ → RiskRegistry[]
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Test Planner   │ → TestMatrix[]
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Test Writer    │ → TestFile
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  QA Reviewer    │ → CoverageResult
└─────────────────┘
        │
        ├── [plannerRevised=false] → Return final result
        │
        └── [plannerRevised=true, uncovered HIGH/CRITICAL risks]
                │
                ▼
        ┌─────────────────┐
        │  Test Planner   │ → Revised TestMatrix[]
        └─────────────────┘
                │
                ▼
        ┌─────────────────┐
        │  Test Writer    │ → Revised TestFile
        └─────────────────┘
                │
                ▼
        ┌─────────────────┐
        │  QA Reviewer    │ → Final CoverageResult
        └─────────────────┘
```

---

## Frontend Component Tree

```
app/
  layout.tsx          — root layout
  page.tsx            — homepage (hero, input form, examples)
  analyze/
    page.tsx          — results page

components/
  InputPanel.tsx      — spec input textarea + type/framework selectors
  AgentProgress.tsx   — agent timeline with status indicators
  RiskRegistry.tsx    — risk table with severity badges
  TestMatrix.tsx      — test case table grouped by category
  TestFileOutput.tsx  — syntax-highlighted generated test code
  CoverageScore.tsx   — score display with visual indicator
  GapReport.tsx       — gap list and reviewer feedback
```

---

## File Structure

```
specsmith/
  app/
    layout.tsx
    page.tsx
    analyze/page.tsx
    api/analyze/route.ts
  components/
    InputPanel.tsx
    AgentProgress.tsx
    RiskRegistry.tsx
    TestMatrix.tsx
    TestFileOutput.tsx
    CoverageScore.tsx
    GapReport.tsx
  lib/
    agents/
      spec-parser.ts
      risk-mapper.ts
      test-planner.ts
      test-writer.ts
      qa-reviewer.ts
      pipeline.ts
    providers/
      index.ts
      mock-provider.ts
      api-provider.ts
      amd-provider.ts
    schemas/
      analysis.ts
  agents/          — development agent guides
  docs/
    amd-setup.md
  examples/
    todo-api-spec.md
    checkout-flow-prd.md
    user-auth-openapi.yaml
  .env.example
```

---

## Fallback Strategy

```
AMD mode unavailable → fall back to API mode
API mode unavailable → fall back to mock mode
```

The mock mode always succeeds. It is the guaranteed demo path.

---

## AMD Integration Strategy

1. **Mock mode** (now): hardcoded fixture outputs
2. **API mode** (next): OpenAI-compatible provider (any model)
3. **AMD mode** (final): vLLM endpoint on AMD Developer Cloud

AMD mode uses the same `AiProvider` interface as API mode. The only difference is the base URL and model name, pointing at a vLLM server running Qwen on AMD MI300X.

```
AMD_ENDPOINT=http://<amd-cloud-ip>:8000
AMD_MODEL=Qwen/Qwen2.5-72B-Instruct
```

The pipeline does not change between modes. Only the provider changes.
