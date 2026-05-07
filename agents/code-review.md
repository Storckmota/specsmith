# Code Review Agent — Review Checklist

## TypeScript

- [ ] No `any` types
- [ ] All function parameters and return types are annotated
- [ ] Strict null checks handled
- [ ] No implicit `undefined` returns from async functions
- [ ] Proper use of `Promise<T>` for async functions

## Zod Schemas

- [ ] All schemas in `lib/schemas/analysis.ts`
- [ ] Agent input/output types derived from Zod schemas (`.infer`)
- [ ] `.parse()` used at schema boundaries (not `.safeParse()` unless error recovery is needed)
- [ ] Enum values match the output contract in SPEC.md

## API Route (`app/api/analyze/route.ts`)

- [ ] Request body is validated before use
- [ ] Error responses use standard shape: `{ error: string }`
- [ ] HTTP status codes are correct (200, 400, 500)
- [ ] No secrets logged
- [ ] No user input passed to shell commands or eval

## Providers

- [ ] All providers implement the `AiProvider` interface
- [ ] Provider selected via `PROVIDER` env var, not hardcoded
- [ ] Mock provider returns realistic fixture data
- [ ] API/AMD providers handle network errors gracefully

## UI Components

- [ ] No `any` types in component props
- [ ] Props interfaces defined above the component
- [ ] No inline styles (use Tailwind)
- [ ] No hardcoded colors outside Tailwind classes
- [ ] Loading and error states handled
- [ ] No console.log in component code

## Error Handling

- [ ] API route has try/catch around pipeline execution
- [ ] Frontend shows error state on non-200 response
- [ ] No unhandled promise rejections
- [ ] No silent failures (errors must surface to the user or logs)

## Provider Mode Display

- [ ] UI shows current provider mode
- [ ] UI does not show "AMD mode" when running mock or API mode
- [ ] Provider mode comes from API response or environment
