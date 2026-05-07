# PROJECT.md — SpecSmith

## Hackathon Metadata

- **Event**: AMD Developer Hackathon by lablab.ai
- **Track**: AI Agents & Agentic Workflows
- **Team Name**: SpecSmith PopLabs
- **Project Name**: SpecSmith
- **Submission Deadline**: TBD — check lablab.ai event page

---

## Decision Lock

**SpecSmith is the chosen project. Do not reopen ideation unless there is a hard technical blocker.**

The idea is locked. The framing is locked. The stack is locked.

---

## Judging Criteria & Strategy

### 1. Use of AMD Hardware / ROCm
**Strategy**: Implement AMD mode via vLLM serving Qwen on AMD MI300X. Build mock mode first, API mode second, AMD mode third. Provide screenshots, logs, and documentation as AMD proof. Do not claim AMD usage before AMD mode is wired.

### 2. Agentic Behavior / Multi-Agent Workflow
**Strategy**: The 5-agent pipeline is the core product. The QA Reviewer feedback loop is the required agentic behavior — it triggers conditional revision when HIGH/CRITICAL risks are uncovered. Make this visible in the UI agent timeline.

### 3. Technical Implementation
**Strategy**: Clean TypeScript, Zod schemas, provider abstraction, proper error handling. The pipeline architecture is well-defined in ARCHITECTURE.md.

### 4. Product Value / Innovation
**Strategy**: SpecSmith is framed as risk reduction, not generic productivity. "SpecSmith finds what your team forgot to test" is the pitch. The output is a risk registry + test matrix + executable tests + coverage score — not just a test list.

### 5. Demo Quality
**Strategy**: The mock pipeline guarantees a working demo regardless of AMD Cloud availability. The UI shows agent progress, risk severity, test categories, and coverage score. Load an example spec and click Analyze — the demo is self-contained.

---

## Submission Requirements

- [ ] Working demo (locally or deployed)
- [ ] Project description on lablab.ai
- [ ] GitHub repository link
- [ ] Video demo (if required by event)
- [ ] AMD proof: docs/amd-setup.md + screenshots/logs
- [ ] README with setup instructions

---

## Current Project Status

**Phase**: Phase 1 — Mock Pipeline  
**Status**: In progress

Completed:
- Repository scaffold
- Next.js project initialized
- Documentation files created
- Mock pipeline implemented
- UI components created
- Zod schemas defined

In progress:
- UI polish
- Build verification

Not started:
- API mode
- AMD/Qwen mode
- AMD Developer Cloud setup

---

## Track: AI Agents & Agentic Workflows

SpecSmith qualifies because:
1. It uses a multi-agent pipeline (5 named agents with distinct responsibilities)
2. It includes a real feedback loop (QA Reviewer → Test Planner revision)
3. The feedback loop is conditional (only triggers if HIGH/CRITICAL risks are uncovered)
4. The agentic workflow is visible in the UI
