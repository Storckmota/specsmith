# SpecSmith Deployment Guide

## Provider modes

| Mode | Use case | Requires |
|---|---|---|
| `PROVIDER=mock` | Public demo, development, CI | Nothing — no API key |
| `PROVIDER=api` | Controlled live demo, testing | `API_KEY` (server-side only) |
| `PROVIDER=amd` | AMD MI300X inference | vLLM endpoint — not active yet |

## Public demo deploy (PROVIDER=mock)

Safe for any public or uncontrolled environment. No API key required.

```bash
# .env.local (or platform env vars)
PROVIDER=mock
```

The mock provider runs all 5 pipeline agents and returns realistic fixture output. There are no external calls and no cost.

## Controlled API demo (PROVIDER=api)

Use only in a supervised environment. Keep `API_KEY` out of any public config.

```bash
# .env.local — never commit this file
PROVIDER=api
API_KEY=sk-...
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o-mini
```

- Use `gpt-4o-mini` for cost-effective validation. Switch to a stronger model only if output quality requires it for a final demo.
- `API_KEY` is read server-side only — it is never sent to the browser.
- Do not expose `PROVIDER=api` publicly without adding your own rate limiting or authentication in front of `/api/analyze`.

## Build

```bash
npm install
npm run build        # production build
npx tsc --noEmit     # type check
```

## Local validation checklist

- [ ] `git status` is clean — `.env.local` is not staged
- [ ] `npm run build` passes with no errors
- [ ] `npx tsc --noEmit` passes with no output
- [ ] Mock mode works: `PROVIDER=mock` in `.env.local`, load an example, run analysis
- [ ] `.env.local` is listed in `.gitignore` (it is, under `.env*`)
- [ ] No real API keys appear in any committed file

## Platform env vars (Vercel / Netlify / Railway)

Set these in the platform dashboard — do not commit them:

**Mock deploy (recommended for public):**
```
PROVIDER=mock
```

**Controlled API demo:**
```
PROVIDER=api
API_KEY=<your key>
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o-mini
```

> `DEBUG_AGENT_OUTPUT` is unset by default. Set to `true` only locally to include model output previews in parse error messages.
