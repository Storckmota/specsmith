# SpecSmith Deployment Guide

## Provider modes

| Mode | Use case | Requires |
|---|---|---|
| `PROVIDER=mock` | Local development, CI, safe fallback | Nothing — no API key |
| `PROVIDER=api` | Public demo, controlled live demo | `API_KEY` (server-side only) |
| `PROVIDER=amd` | AMD MI300X inference | vLLM endpoint — not active yet |

---

## Public demo deploy — API Fast Mode

SpecSmith's public demo uses `PUBLIC_DEMO_FAST_MODE=true`: a single real LLM call
that generates a complete Forge Report based on the user's actual spec. This fits
within Vercel Hobby's function limits while returning context-aware, non-mock output.

The production deployment uses a reliable low-cost OpenAI-compatible model. The same
code path works with any provider — swap `API_BASE_URL` and `API_MODEL` to use
Qwen via OpenRouter or a future AMD/vLLM endpoint without code changes.

```bash
# Platform env vars (Vercel / Netlify / Railway) — do not commit
PROVIDER=api
API_KEY=<your_openai_key>
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4.1-nano
API_TIMEOUT_MS=25000
API_ROUTE_TIMEOUT_MS=50000
PUBLIC_DEMO_FAST_MODE=true
ENABLE_PROVIDER_FALLBACK=false
DEBUG_AGENT_OUTPUT=false
```

**What fast mode does**:
- One `POST /chat/completions` call to the configured model
- Model analyzes the user's spec and returns a complete JSON Forge Report
- 4–6 risks, 6–10 test cases, deterministic test file, coverage score
- Output is based on the user's actual spec — not canned fixture data
- `providerMode` in the response: `"API mode · Qwen fast demo"`

**Model guidance**:

| Model | Role | Suitable for Vercel Hobby (fast mode) |
|---|---|---|
| `gpt-4.1-nano` | **Production public demo** | Yes — reliable, fast, low-cost |
| `gpt-4o-mini` | Controlled local test | Yes — fast mode or full pipeline |
| `qwen/qwen-2.5-7b-instruct` | Qwen path (available, not production default) | Yes — via OpenRouter |
| `qwen/qwen-2.5-72b-instruct` | Qwen validation evidence | No — ~325s total |

**Timeout strategy**:
- `API_TIMEOUT_MS=25000` — per-model-call timeout via `AbortController` (25s per call)
- `API_ROUTE_TIMEOUT_MS=50000` — total route deadline (50s). Returns HTTP 504 JSON
  before Vercel's platform can return an HTML timeout page

**Failure behavior** (`ENABLE_PROVIDER_FALLBACK=false`):
If the provider times out, returns a non-2xx response, or produces malformed output:
- HTTP 504 (deadline) or 502 (parse failure) with JSON `{ "error": "..." }`
- Frontend shows the error message — no raw HTML, no stack trace
- User can retry with a shorter spec or try again later

**Optional mock fallback** (`ENABLE_PROVIDER_FALLBACK=true`):
Set this only for internal demos where uptime matters more than result authenticity.
When enabled, provider failures return mock output labeled `"API mode → Mock fallback"`.
**Do not use for the public demo** — it returns a canned report that ignores the
user's actual spec, which is misleading.

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

**Public demo — Fast Mode (Vercel Hobby):**
```
PROVIDER=api
API_KEY=<openai_key>
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4.1-nano
API_TIMEOUT_MS=25000
API_ROUTE_TIMEOUT_MS=50000
PUBLIC_DEMO_FAST_MODE=true
ENABLE_PROVIDER_FALLBACK=false
DEBUG_AGENT_OUTPUT=false
```
`PUBLIC_DEMO_FAST_MODE=true` uses a single LLM call for the full Forge Report.
`API_TIMEOUT_MS=25000` caps the single model call. `API_ROUTE_TIMEOUT_MS=50000`
returns a JSON 504 before Vercel's platform timeout. `ENABLE_PROVIDER_FALLBACK=false`
ensures failures show a friendly error, not a canned report.

To use Qwen via OpenRouter instead: set `API_BASE_URL=https://openrouter.ai/api/v1`,
`API_MODEL=qwen/qwen-2.5-7b-instruct`, and `API_KEY=<openrouter_key>`. No code changes.

**Safe local mock deploy (no API key required):**
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
