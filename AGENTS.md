<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — SpecSmith Agent Definitions

## Part 1: Product Agents (the 5-agent QA pipeline)

---

### Agent 1: Spec Parser

**Role**: Extract structured information from raw spec input.

**Input**:
```typescript
{
  specText: string
  inputType: "prd" | "openapi" | "github_issue" | "plain_spec"
}
```

**Output** (`ParsedSpec`):
```typescript
{
  title: string
  detectedScope: string
  userStories: string[]
  businessRules: string[]
  apiEndpoints: string[]
  assumptions: string[]
  constraints: string[]
}
```

**Responsibilities**:
- Normalize all input types to a common structure
- Identify the scope and title of the spec
- Extract explicit and implicit requirements

---

### Agent 2: Risk Mapper

**Role**: Identify and rank QA risks from the parsed spec.

**Input**: `ParsedSpec`

**Output**: `RiskItem[]`
```typescript
{
  id: string              // "R-001"
  title: string
  description: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  sourceRef: string
  whyItMatters: string
  linkedTestIds: string[]
}
```

---

### Agent 3: Test Planner

**Role**: Create a structured test matrix from the parsed spec and risk registry.

**Input**: `ParsedSpec` + `RiskItem[]`

**Output**: `TestCase[]`
```typescript
{
  id: string
  title: string
  category: "happy_path" | "edge_case" | "negative_case" | "regression" | "api_validation" | "abuse_case"
  priority: "LOW" | "MEDIUM" | "HIGH"
  given: string
  when: string
  then: string
  linkedRiskIds: string[]
}
```

**Feedback loop**: If QA Reviewer detects uncovered HIGH/CRITICAL risks, Test Planner adds targeted tests for those specific risk IDs.

---

### Agent 4: Test Writer

**Role**: Generate executable test code from the test matrix.

**Input**: `TestCase[]` + `framework: "playwright" | "jest" | "pytest"`

**Output**: `TestFile`
```typescript
{
  framework: string
  filename: string
  code: string
}
```

---

### Agent 5: QA Reviewer

**Role**: Review coverage, score completeness, identify gaps, and trigger revision if needed.

**Input**: `TestCase[]` + `RiskItem[]` + `TestFile`

**Output**: `CoverageResult`
```typescript
{
  score: number
  summary: string
  gaps: string[]
  reviewerFeedback: string
  plannerRevised: boolean
}
```

**Feedback Loop**:
1. Check each HIGH/CRITICAL risk for linked test IDs
2. If any HIGH/CRITICAL risk has no linked tests → set `plannerRevised: true`
3. Signal pipeline to re-run Test Planner (targeted) + Test Writer
4. Re-score after revision
5. Maximum one revision pass

---

## Part 2: Development Agents

### Implementation Agent
See `agents/implementation.md`

### Architect Agent
See `agents/architect.md`

### Code Review Agent
See `agents/code-review.md`

### QA Acceptance Agent
See `agents/qa-acceptance.md`

### Security Review Agent
See `agents/security-review.md`

### Handoff Agent
See `agents/handoff.md`
