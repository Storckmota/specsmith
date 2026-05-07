# AMD Developer Cloud Setup Guide

## Status: PLACEHOLDER — AMD mode not yet wired

This document will be updated with real steps once AMD Developer Cloud access is obtained.

---

## What We're Building Toward

SpecSmith in AMD mode calls a vLLM server running Qwen on AMD MI300X via an OpenAI-compatible API.

```
PROVIDER=amd
AMD_ENDPOINT=http://<amd-cloud-ip>:8000
AMD_MODEL=Qwen/Qwen2.5-72B-Instruct
```

The AmdProvider in `lib/providers/amd-provider.ts` handles the API call. No other code changes are needed to switch to AMD mode.

---

## AMD Developer Cloud Access

- TODO: Get access to AMD Developer Cloud
- TODO: Note the endpoint URL and credentials
- TODO: Screenshot the AMD Developer Cloud dashboard

## vLLM Setup on MI300X

- TODO: Document the vLLM launch command for Qwen on MI300X
- TODO: Note ROCm version used
- TODO: Note GPU memory usage for the chosen model

Example vLLM launch command (DO NOT USE — not verified):
```bash
# TODO: verify this command against AMD Developer Cloud docs
vllm serve Qwen/Qwen2.5-72B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 2
```

## Qwen Model Selection

| Model | VRAM | Notes |
|---|---|---|
| Qwen/Qwen2.5-7B-Instruct | ~16GB | Fastest, good for testing |
| Qwen/Qwen2.5-14B-Instruct | ~28GB | Good balance |
| Qwen/Qwen2.5-72B-Instruct | ~144GB | Best quality, needs MI300X |

---

## AMD Proof Checklist

To claim AMD usage in the submission:

- [ ] AMD Developer Cloud account created
- [ ] vLLM running on MI300X (screenshot the instance)
- [ ] Qwen model loaded and responding
- [ ] SpecSmith `PROVIDER=amd` mode tested end-to-end
- [ ] Screenshot: AMD Developer Cloud dashboard
- [ ] Screenshot: vLLM startup logs showing ROCm/HIP device
- [ ] Screenshot: SpecSmith UI showing "Provider: AMD/Qwen mode"
- [ ] Log: successful pipeline call response

---

## Why AMD MI300X for SpecSmith

- **Long context**: Product specs and OpenAPI docs can be large. MI300X + Qwen2.5-72B handles 32k+ token contexts.
- **Multi-agent inference**: 5 agents × potentially long specs = high total token volume. MI300X memory bandwidth handles this efficiently.
- **Code generation**: Qwen2.5 has strong coding benchmarks, important for generating valid Playwright/Jest/Pytest code.
- **ROCm ecosystem**: vLLM supports ROCm, making deployment to AMD hardware straightforward with the same API as OpenAI.

---

## Screenshots to Capture (TODO)

1. AMD Developer Cloud dashboard showing MI300X instance
2. vLLM startup log showing ROCm device detected
3. vLLM log showing model loaded
4. curl request to vLLM endpoint succeeding
5. SpecSmith UI showing "Provider: AMD/Qwen mode"
6. Full pipeline result from AMD mode
