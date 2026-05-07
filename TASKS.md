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
- [ ] Verify build passes (npm run build)
- [ ] Manual smoke test of demo flow

---

## Phase 3: Real API Provider

- [ ] Implement ApiProvider (lib/providers/api-provider.ts)
- [ ] Implement AmdProvider (lib/providers/amd-provider.ts)
- [ ] Write actual agent prompts for Spec Parser
- [ ] Write actual agent prompts for Risk Mapper
- [ ] Write actual agent prompts for Test Planner
- [ ] Write actual agent prompts for Test Writer
- [ ] Write actual agent prompts for QA Reviewer
- [ ] Test with OpenAI-compatible provider

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

- [ ] Review UI for demo-readiness
- [ ] Ensure agent timeline is clearly visible
- [ ] Ensure feedback loop events are visible
- [ ] Add provider mode display to UI
- [ ] Review all example specs for demo quality
- [ ] Run full demo flow end-to-end

---

## Phase 6: Submission

- [ ] Final build verification
- [ ] Record demo video (if required)
- [ ] Submit to lablab.ai
- [ ] Ensure GitHub repo is public
- [ ] Complete lablab.ai project description
- [ ] Final README review
