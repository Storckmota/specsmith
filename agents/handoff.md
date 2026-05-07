# Handoff Agent — Project State Format

## Purpose

This document defines how to hand off SpecSmith to another agent. Use this format when context needs to be transferred.

---

## Handoff Format

When writing a handoff, fill in each section:

```
## SpecSmith Handoff — [date]

### Current Status
Phase: [0-6]
Last completed task: [task from TASKS.md]
Next required task: [task from TASKS.md]

### What Works Right Now
- [list of verified working features]

### What Does Not Work
- [list of known broken or incomplete features]

### Last Known Blockers
- [any blocked tasks and why]

### Provider Mode
Current default: [mock | api | amd]
API mode tested: [yes | no]
AMD mode tested: [yes | no]

### Build Status
npm run build: [pass | fail | unknown]
npm run dev: [works | broken | unknown]

### Files Modified Since Last Handoff
- [list of changed files]

### Environment
Node version: [x.x.x]
OS: [windows | mac | linux]
Working directory: [path]

### Open Questions
- [any unresolved decisions]

### Submission Checklist Status
See ACCEPTANCE_CRITERIA.md — [X of Y] items checked
```

---

## Submission Checklist (final handoff)

Before the final handoff before submission, verify:

- [ ] All Phase 0-2 tasks in TASKS.md are complete
- [ ] `npm run build` passes
- [ ] Full demo flow tested manually
- [ ] No real API keys in repository
- [ ] AMD strategy documented accurately (do not overclaim)
- [ ] README is accurate
- [ ] lablab.ai project page is filled out
- [ ] Repository is public
- [ ] Demo video recorded (if required)
