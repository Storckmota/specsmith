# TASKS.md — SpecSmith Task Board

## Phase 0: Repo Setup

- [x] Create specsmith folder
- [x] Initialize Next.js 16 project
- [x] Install Zod
- [x] Create directory structure
- [x] Write README.md
- [x] Write PROJECT.md
- [x] Write SPEC.md
- [x] Write ARCHITECTURE.md
- [x] Write TASKS.md
- [x] Write AGENTS.md
- [x] Write ACCEPTANCE_CRITERIA.md
- [x] Write agents/implementation.md
- [x] Write agents/architect.md
- [x] Write agents/code-review.md
- [x] Write agents/qa-acceptance.md
- [x] Write agents/security-review.md
- [x] Write agents/handoff.md
- [x] Write docs/amd-setup.md
- [x] Write examples/todo-api-spec.md
- [x] Write examples/checkout-flow-prd.md
- [x] Write examples/user-auth-openapi.yaml
- [x] Write .env.example
- [x] Initial git commit

---

## Phase 1: Mock Pipeline

- [x] Define Zod schemas (lib/schemas/analysis.ts)
- [x] Implement MockProvider (lib/providers/mock-provider.ts)
- [x] Implement provider index (lib/providers/index.ts)
- [x] Implement Spec Parser agent (lib/agents/spec-parser.ts)
- [x] Implement Risk Mapper agent (lib/agents/risk-mapper.ts)
- [x] Implement Test Planner agent (lib/agents/test-planner.ts)
- [x] Implement Test Writer agent (lib/agents/test-writer.ts)
- [x] Implement QA Reviewer agent with feedback loop (lib/agents/qa-reviewer.ts)
- [x] Implement pipeline orchestrator (lib/agents/pipeline.ts)
- [x] Implement API route (app/api/analyze/route.ts)

---

## Phase 2: Frontend MVP

- [x] Update app layout (app/layout.tsx)
- [x] Build homepage (app/page.tsx)
- [x] Build analyze page (app/analyze/page.tsx)
- [x] Build InputPanel component
- [x] Build AgentProgress component
- [x] Build RiskRegistry component
- [x] Build TestMatrix component
- [x] Build TestFileOutput component
- [x] Build CoverageScore component
- [x] Build GapReport component
- [x] Verify build passes (npm run build)
- [ ] Manual smoke test of demo flow

---

## Phase 3: Real API Provider

- [x] Implement ApiProvider (lib/providers/api-provider.ts)
  - Early fail if API_KEY missing
  - AbortController timeout (90s)
  - Error body surfacing without key exposure
- [x] Implement AmdProvider placeholder (lib/providers/amd-provider.ts)
- [x] Create lib/utils/json.ts — shared extractJson (fence stripping, first-brace extraction)
- [x] Update all agents to use shared extractJson (removed local duplicates)
- [x] Write agent prompts for Spec Parser (explicit JSON-only instructions)
- [x] Write agent prompts for Risk Mapper (sourceRef guidance, no line numbers)
- [x] Write agent prompts for Test Planner (schema-exact, revision prompt preserved)
- [x] Write agent prompts for Test Writer (JSON object, code field guidance)
- [x] Update .env.example with clear inline documentation
- [x] Update README.md — API mode section, testing provider modes section
- [x] Update ARCHITECTURE.md — JSON utility, API provider security
- [ ] Test with OpenAI-compatible provider (manual)

---

## Phase 4: AMD/Qwen Proof

- [ ] Get AMD Developer Cloud access
- [ ] Set up vLLM with Qwen on MI300X
- [ ] Configure AMD_ENDPOINT and AMD_MODEL
- [ ] Test AmdProvider end-to-end
- [ ] Capture screenshots and logs
- [ ] Update docs/amd-setup.md with real steps
- [ ] Add AMD proof to README

---

## Phase 5: Demo Polish

- [x] Review UI for demo-readiness
- [x] Ensure agent timeline is clearly visible
- [x] Ensure feedback loop events are visible
- [x] Add provider mode display to UI
- [ ] Review all example specs for demo quality
- [ ] Run full demo flow end-to-end

### Frontend Polish (completed 2026-05-07)
- [x] Reduce hero vertical whitespace, tighten section rhythm
- [x] Replace plain-text feature list with purple-dot badge chips
- [x] Strengthen input card border, add card header label
- [x] Improve example button, textarea, and selector styling
- [x] Enlarge and strengthen primary CTA button with spinner
- [x] Redesign "How it works" section: numbered circles, gradient connector, feedback-loop badge on QA Reviewer
- [x] Analyze page: expand summary to 6-stat grid (critical, high, medium, total risks, tests, score)
- [x] Analyze page: add framework + providerMode badges to summary header
- [x] AgentProgress: step-number circles, SVG status icons, styled status pills, divide-y layout
- [x] CoverageScore: add linear progress bar + quality label alongside circular gauge
- [x] RiskRegistry: severity dot accent, count badges in header, improved layout
- [x] TestMatrix: improved filter bar, chevron icon, linked-risks section in expanded row
- [x] TestFileOutput: fake window chrome, line count display, SVG copy icon
- [x] GapReport: SVG icons, improved empty state, revision notice redesign
- [x] Sticky nav on both pages with backdrop-blur
- [x] Build verified: npm run build passes

---

## Phase 6: Submission

- [ ] Final build verification
- [ ] Record demo video (if required)
- [ ] Submit to lablab.ai
- [ ] Ensure GitHub repo is public
- [ ] Complete lablab.ai project description
- [ ] Final README review
