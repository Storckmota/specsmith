# ACCEPTANCE_CRITERIA.md — SpecSmith MVP

## MVP Pass/Fail Criteria

### Must Pass (blockers)

- [ ] App runs locally with `npm run dev`
- [ ] App builds without errors with `npm run build`
- [ ] Homepage renders with input form and example buttons
- [ ] Loading an example spec populates the input
- [ ] Clicking Analyze calls `/api/analyze`
- [ ] The analyze page renders with all output sections
- [ ] Risk registry shows at least 3 risks with severity badges
- [ ] Test matrix shows tests across at least 3 categories
- [ ] Generated test file contains runnable code syntax
- [ ] Coverage score is displayed as a number 0-100
- [ ] Gap report lists at least one gap
- [ ] Agent timeline shows all 5 agents
- [ ] No API key required in mock mode (`PROVIDER=mock`)

### QA Reviewer Feedback Loop (required for agentic claim)

- [ ] The mock pipeline includes conditional logic: if HIGH/CRITICAL risks are uncovered, revision is triggered
- [ ] The agent timeline shows the feedback loop events when revision is triggered:
  - "QA Reviewer detected coverage gap"
  - "Test Planner revision started"
  - "Test Writer revision started"
  - "Coverage updated"
- [ ] `plannerRevised: true` appears in the API response when feedback loop fires
- [ ] The feedback loop does NOT always fire — it is conditional

---

## Demo Requirements

A passing demo must show:

1. Homepage loads in < 3 seconds
2. User clicks "Load Example" and spec text appears
3. User clicks "Analyze"
4. Agent timeline animates through all 5 agents
5. If feedback loop fires: timeline shows the revision events
6. All result sections render: risk registry, test matrix, test file, coverage score, gap report
7. The UI clearly states the provider mode (e.g., "Provider: Mock mode")

---

## AMD Proof Criteria

To claim AMD usage in the submission:

- [ ] `PROVIDER=amd` mode must be actually wired and functional
- [ ] At minimum: a successful API call to vLLM on AMD Developer Cloud
- [ ] Screenshot or log showing the AMD endpoint responding
- [ ] `docs/amd-setup.md` must be updated with real steps (not TODOs)

Until this is met: claim "built for AMD MI300X" not "running on AMD MI300X."

---

## Agentic Behavior Criteria

To qualify for the "AI Agents & Agentic Workflows" track:

- [ ] At least 5 named agents with distinct roles
- [ ] At least one conditional feedback loop (not just sequential execution)
- [ ] The feedback loop must change the output (not just log a message)
- [ ] The agentic workflow must be visible to the user (agent timeline)

---

## Before Submission Checklist

- [ ] All Phase 0 tasks complete
- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] Build passes
- [ ] Full demo flow tested manually
- [ ] README is accurate and complete
- [ ] No real API keys in repository
- [ ] AMD strategy documented accurately
- [ ] lablab.ai project description written
- [ ] Demo video recorded (if required)
