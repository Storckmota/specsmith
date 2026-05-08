# SpecSmith Deployment Guide

## Provider modes

| Mode | Use case | Requires |
|---|---|---|
| `PROVIDER=mock` | Local development, CI, safe fallback | Nothing — no API key |
| `PROVIDER=api` | Public Qwen demo, controlled live demo | `API_KEY` (server-side only) |
| `PROVIDER=amd` | AMD MI300X inference | vLLM endpoint — not active yet |

---

## Public demo deploy with Qwen via OpenRouter

SpecSmith's public demo is configured for `PROVIDER=api` with Qwen via OpenRouter.
The `ENABLE_PROVIDER_FALLBACK=true` setting ensures the demo never crashes: if the
provider times out or fails, the pipeline returns mock output instead, and `providerMode`
in the response is set to `"API mode → Mock fallback"` so the fallback is always visible.

```bash
# Platform env vars (Vercel / Netlify / Railway) — do not commit
PROVIDER=api
API_KEY=<your_openrouter_key>
API_BASE_URL=https://openrouter.ai/api/v1
API_MODEL=qwen/qwen-2.5-7b-instruct
API_TIMEOUT_MS=8000
ENABLE_PROVIDER_FALLBACK=true
DEBUG_AGENT_OUTPUT=false
```

**Model guidance for Vercel**:
`qwen/qwen-2.5-72b-instruct` was validated end-to-end (score 95/100) but took
~325 seconds — far too slow for any Vercel function tier. Use the 7B model for
the public deploy:

| Model | Role | Suitable for Vercel Hobby |
|---|---|---|
| `qwen/qwen-2.5-72b-instruct` | Validation evidence | No — ~325s exceeds all limits |
| `qwen/qwen-2.5-7b-instruct` | **Public Vercel demo** | Yes — with `API_TIMEOUT_MS=8000` |
| `gpt-4o-mini` | Controlled local test | Locally only (60-90s per pipeline) |

**Timeout and fallback**:
`API_TIMEOUT_MS=8000` (8 seconds) is chosen for Vercel Hobby safety. Each provider
call is aborted after 8 seconds. If the call fails, `ENABLE_PROVIDER_FALLBACK=true`
causes the pipeline to return mock output in `~1s`, for a total response time of
`~9s` — within Vercel Hobby's 10-second function window.

The fallback triggers only if the provider throws (timeout, 5xx, network error).
Vercel killing the function at the platform level bypasses all JavaScript — which is
why `API_TIMEOUT_MS` must be set lower than Vercel's limit, not equal to it.

`providerMode` in the response is always honest:
- `"API mode"` — real Qwen output returned
- `"API mode → Mock fallback"` — provider failed, mock output returned

**Qwen validation evidence**: `qwen/qwen-2.5-72b-instruct` was validated locally
(not on Vercel) with the full 5-agent pipeline, score 95/100. See `docs/qwen-validation.md`.

**Abuse protection**: The public `/api/analyze` route includes:
- Per-IP in-memory rate limit: 3 analysis requests per 10 minutes (HTTP 429)
- Spec length limit: 15,000 characters (HTTP 413)
- In-flight dedup: concurrent identical requests join the same pipeline run

This is best-effort single-process protection appropriate for a hackathon demo.
It is not distributed or production-grade rate limiting.

---

## Safe local fallback deploy (PROVIDER=mock)

For local development or if you need a safe, zero-cost deployment with no API key:

```bash
PROVIDER=mock
```

The mock provider runs all 5 pipeline agents and returns realistic fixture output.
There are no external calls and no cost.

---

## Controlled API demo (PROVIDER=api without fallback)

For a strict API-only controlled local test — no fallback, errors surface directly:

```bash
# .env.local — never commit this file
PROVIDER=api
API_KEY=sk-...
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o-mini
ENABLE_PROVIDER_FALLBACK=false
```

- `API_KEY` is read server-side only — never sent to the browser
- Do not deploy `PROVIDER=api` publicly without rate limiting (already built in) and
  ensuring `API_KEY` is stored as a platform secret, not in any committed file

---

## Build

```bash
npm install
npm run build        # production build
npx tsc --noEmit     # type check
```

---

## Local validation checklist

- [ ] `git status` is clean — `.env.local` is not staged
- [ ] `npm run build` passes with no errors
- [ ] `npx tsc --noEmit` passes with no output
- [ ] Mock mode works: `PROVIDER=mock` in `.env.local`, load an example, run analysis
- [ ] `.env.local` is listed in `.gitignore` (it is, under `.env*`)
- [ ] No real API keys appear in any committed file

---

## Platform env vars reference (Vercel)

**Public Qwen demo (Vercel Hobby safe):**
```
PROVIDER=api
API_KEY=<openrouter_key>
API_BASE_URL=https://openrouter.ai/api/v1
API_MODEL=qwen/qwen-2.5-7b-instruct
API_TIMEOUT_MS=8000
ENABLE_PROVIDER_FALLBACK=true
DEBUG_AGENT_OUTPUT=false
```
`API_TIMEOUT_MS=8000` ensures fallback fires before Vercel Hobby's 10s function limit.

**Safe mock fallback deploy:**
```
PROVIDER=mock
```

> `DEBUG_AGENT_OUTPUT` — leave unset in production. Set to `true` only locally to
> include model output previews in parse error messages.

---

## AMD Developer Cloud (planned)

AMD mode targets a vLLM server running Qwen on AMD MI300X. The interface is identical
to API mode — only `PROVIDER`, `AMD_ENDPOINT`, and `AMD_MODEL` change. AMD Developer
Cloud GPU credits are pending; AMD mode is not yet active. See `docs/amd-setup.md`.
