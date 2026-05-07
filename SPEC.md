# SPEC.md — SpecSmith Product Specification

## Product Summary

SpecSmith is an agentic QA system that turns product specs, PRDs, GitHub issues, and API/OpenAPI docs into risk-ranked QA findings, test matrices, edge cases, executable test drafts, a QA coverage score, and a coverage gap report.

**Core pitch**: "SpecSmith finds what your team forgot to test."

---

## Personas

### Primary: Developer on a small team
- Writes specs or PRDs
- Owns QA because the team has no dedicated QA engineer
- Has limited time for manual test planning
- Needs to catch edge cases before deployment

### Secondary: QA Engineer
- Receives specs late in the cycle
- Needs to quickly build a test plan
- Wants executable test drafts to speed up implementation

### Tertiary: Tech Lead / Engineering Manager
- Wants visibility into test coverage before release
- Needs a coverage score to communicate QA health to stakeholders

---

## Input Types

| Type | Description | Example |
|---|---|---|
| `prd` | Product Requirements Document | Feature spec with user stories |
| `openapi` | OpenAPI / Swagger YAML or JSON | API endpoint definitions |
| `github_issue` | GitHub issue text | Bug report or feature request |
| `plain_spec` | Plain English spec | Informal feature description |

---

## Output Format

```json
{
  "summary": {
    "title": "string",
    "inputType": "prd | openapi | github_issue | plain_spec",
    "detectedScope": "string"
  },
  "riskRegistry": [
    {
      "id": "R-001",
      "title": "string",
      "description": "string",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "sourceRef": "string",
      "whyItMatters": "string",
      "linkedTestIds": ["T-001"]
    }
  ],
  "testMatrix": [
    {
      "id": "T-001",
      "title": "string",
      "category": "happy_path | edge_case | negative_case | regression | api_validation | abuse_case",
      "priority": "LOW | MEDIUM | HIGH",
      "given": "string",
      "when": "string",
      "then": "string",
      "linkedRiskIds": ["R-001"]
    }
  ],
  "testFile": {
    "framework": "playwright | jest | pytest",
    "filename": "string",
    "code": "string"
  },
  "coverage": {
    "score": 0,
    "summary": "string",
    "gaps": ["string"],
    "reviewerFeedback": "string",
    "plannerRevised": true
  }
}
```

---

## Agent Pipeline

### Agent 1: Spec Parser
- **Input**: Raw spec text + input type
- **Output**: Parsed spec (user stories, business rules, API endpoints, assumptions, constraints)
- **Responsibility**: Normalize raw input into structured form for downstream agents

### Agent 2: Risk Mapper
- **Input**: Parsed spec
- **Output**: Risk registry (list of risks with severity, description, source reference)
- **Responsibility**: Flag ambiguous requirements, missing validations, edge cases, fragile flows, security-adjacent abuse cases

### Agent 3: Test Planner
- **Input**: Parsed spec + risk registry
- **Output**: Test matrix (structured test cases across all categories)
- **Responsibility**: Create complete test matrix covering happy path, edge cases, negative cases, regression candidates, API validation, abuse cases

### Agent 4: Test Writer
- **Input**: Test matrix + framework selection
- **Output**: Test file (executable draft in Playwright, Jest, or Pytest)
- **Responsibility**: Generate runnable test code from test matrix entries

### Agent 5: QA Reviewer
- **Input**: Test matrix + risk registry + generated tests
- **Output**: Coverage score, gap report, reviewer feedback, revision flag
- **Responsibility**: Check that all HIGH/CRITICAL risks have linked tests. If not, trigger one revision pass (Test Planner → Test Writer) for uncovered risks.

### Feedback Loop
- QA Reviewer detects uncovered HIGH/CRITICAL risks
- Signals Test Planner to add tests for those specific risks
- Test Writer regenerates the test file with added tests
- QA Reviewer re-scores with final coverage
- Maximum one revision pass (prevents infinite loops)

---

## Coverage Score Algorithm

Simple deterministic MVP scoring:

- Start at 100
- Subtract 15 per uncovered CRITICAL risk
- Subtract 10 per uncovered HIGH risk
- Subtract 3 per missing test category (out of 6)
- Subtract 2 per gap in the gap report
- Minimum score: 0, Maximum score: 100

---

## Non-Goals (MVP)

- No authentication or user accounts
- No database or persistence
- No file upload UI (paste text only)
- No real-time streaming (batch response)
- No multi-spec comparison
- No GitHub integration
- No CI/CD integration
- No custom rule configuration
- No team collaboration features
- No deployment

---

## MVP Acceptance Definition

The MVP is accepted when:

1. A user can paste a spec and receive a full pipeline output
2. The output includes: risk registry, test matrix, test file, coverage score, gap report
3. The QA Reviewer feedback loop fires when HIGH/CRITICAL risks are uncovered
4. The agent timeline is visible in the UI
5. All 5 agents execute in the mock pipeline
6. The app builds and runs locally with `npm run dev`
7. No API key is required to demo the app
