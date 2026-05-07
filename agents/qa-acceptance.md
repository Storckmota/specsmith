# QA Acceptance Agent — Acceptance Review Checklist

## MVP Acceptance Review

Run this checklist before declaring the MVP complete.

### Functional Requirements

- [ ] `npm run dev` starts the app without errors
- [ ] `npm run build` completes without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] "Load Example" buttons populate the textarea
- [ ] Input type selector works (prd, openapi, github_issue, plain_spec)
- [ ] Framework selector works (playwright, jest, pytest)
- [ ] "Analyze" button calls `/api/analyze`
- [ ] Results page renders after analysis
- [ ] Risk registry shows risks with severity badges
- [ ] Test matrix shows tests grouped by category
- [ ] Test file output shows code for the selected framework
- [ ] Coverage score displays as a number
- [ ] Gap report shows at least one gap

### Agentic Workflow Verification

- [ ] Agent timeline shows all 5 agent names
- [ ] Each agent shows a status (pending, running, complete)
- [ ] When feedback loop fires:
  - [ ] "QA Reviewer detected coverage gap" event is visible
  - [ ] "Test Planner revision" event is visible
  - [ ] "Test Writer revision" event is visible
  - [ ] "Coverage updated" event is visible
- [ ] API response includes `plannerRevised: true` when loop fires
- [ ] Feedback loop does not always fire (it is conditional)

### Provider Mode

- [ ] UI shows provider mode label
- [ ] Default mode is "Mock mode" (no API keys needed)
- [ ] Provider mode is accurate (not AMD mode when running mock)

---

## Demo Review Checklist

The demo must be self-contained and repeatable.

- [ ] Load example spec → Analyze → results render in < 10 seconds
- [ ] All result sections are visible without scrolling through errors
- [ ] The agent timeline is clearly the first thing visible on the results page
- [ ] Risk severity badges use distinct colors
- [ ] Coverage score is prominent
- [ ] Generated test code looks syntactically valid

---

## Agentic Workflow Review Checklist

For the lablab.ai "AI Agents & Agentic Workflows" track:

- [ ] At least 5 named agents visible in the UI
- [ ] At least one conditional feedback loop (not always triggered)
- [ ] The feedback loop changes the output (adds tests, updates score)
- [ ] The workflow is visible to the user (not hidden in logs)
- [ ] The product description explains the agentic workflow clearly
