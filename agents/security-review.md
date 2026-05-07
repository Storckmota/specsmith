# Security Review Agent — Lightweight Security Checklist

## Scope

SpecSmith is a local-first, no-auth, no-database web app. The security surface is small. This checklist covers the key risks for an AI web app.

---

## API Key Exposure

- [ ] No API keys in source code
- [ ] No API keys in `.env` files committed to git
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` contains only placeholder values, not real keys
- [ ] `API_KEY` is read from `process.env` only on the server (never exposed to the client)

## Prompt Injection Risk

- [ ] User-supplied spec text is passed to AI providers as user content, not system content
- [ ] System prompts define agent roles and are not modifiable by user input
- [ ] No user input is interpolated directly into system prompts
- [ ] Mock mode: no prompt injection risk (no AI calls)

## Unsafe User Input Handling

- [ ] User input (spec text) is only used as content for AI prompts
- [ ] No eval(), no Function(), no dynamic code execution of user content
- [ ] No shell command execution with user input
- [ ] Input length should be checked before processing (prevent very large payloads)

## Logging Sensitive Data

- [ ] API keys not logged
- [ ] User spec content not logged (may contain sensitive product information)
- [ ] AI provider responses not logged in full (may echo sensitive content)
- [ ] Error logs do not include stack traces in production responses

## Dependency Hygiene

- [ ] Run `npm audit` before submission
- [ ] No known high-severity vulnerabilities in direct dependencies
- [ ] Minimize dependencies — prefer built-in Node.js/Next.js APIs
- [ ] No unnecessary dependencies added

## Next.js Specific

- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] API route does not expose internal error details to the client
- [ ] Server-only code is not accidentally bundled to the client
- [ ] `process.env` access for secrets only in API routes / server components
