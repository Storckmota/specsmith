# Implementation Agent — Rules and Conventions

## Role

Build the product code for SpecSmith. You are responsible for producing working TypeScript that implements the architecture defined in ARCHITECTURE.md and the spec defined in SPEC.md.

---

## Core Rules

1. **Mock-first**: Always implement mock mode before API mode or AMD mode. The mock pipeline must work before touching real providers.

2. **Never claim AMD usage before AMD mode is wired**: The UI must show "Provider: Mock mode" when running mock mode. Do not set AMD branding while running mock.

3. **Keep scope tight**: Do not add features not in SPEC.md. Do not add dependencies not already in package.json unless essential.

4. **Zod for all schemas**: All data structures crossing agent boundaries must be validated with Zod schemas from `lib/schemas/analysis.ts`.

5. **Provider abstraction**: All AI calls must go through `lib/providers/index.ts`. No agent file should import a provider directly.

6. **One API route**: The entire pipeline runs in `app/api/analyze/route.ts`. Do not add additional routes unless explicitly required.

7. **No auth, no database**: Do not add authentication, session management, or data persistence.

---

## Provider Abstraction Expectations

```typescript
// lib/providers/index.ts exports:
export function getProvider(): AiProvider
export interface AiProvider {
  complete(systemPrompt: string, userPrompt: string): Promise<string>
}
```

Agents call `provider.complete(system, user)` and parse the JSON response. In mock mode, the provider returns hardcoded fixture strings. In API mode, it calls an OpenAI-compatible endpoint. In AMD mode, it calls a vLLM endpoint.

---

## Mock Fixture Requirements

Mock fixtures must:
- Return realistic-looking data (not lorem ipsum)
- Include a mix of risk severities (at least one CRITICAL, one HIGH)
- Include tests across multiple categories
- Demonstrate the feedback loop (at least one HIGH/CRITICAL risk uncovered initially)

---

## Coding Conventions

- TypeScript strict mode
- No `any` types
- Prefer `const` over `let`
- Use Zod `.parse()` not `.safeParse()` at schema boundaries (let errors propagate)
- No console.log in production paths (use structured error returns)
- No comments explaining what the code does — only comments explaining why when non-obvious

---

## Prompt Strategy (for API/AMD modes, future)

When implementing real agent prompts:
- System prompt defines the agent role and output format
- User prompt contains the input data
- Output must be valid JSON matching the Zod schema
- Include `You must respond with valid JSON only. No explanation. No markdown.` in system prompts
- Temperature: 0 or low (deterministic output preferred for structured data)

---

## Error Handling

- API route: catch all errors, return 500 with `{ error: string }`
- Agents: throw on parse failures, let the pipeline catch
- Provider: throw on network errors, let the pipeline catch
- Frontend: show error state if API returns non-200
