import type { AiProvider, ModelOptions } from "./mock-provider";

// AMD mode calls a vLLM endpoint on AMD Developer Cloud running Qwen on MI300X.
// The vLLM server exposes an OpenAI-compatible API at AMD_ENDPOINT.
export class AmdProvider implements AiProvider {
  private readonly endpoint: string;
  private readonly model: string;

  constructor() {
    this.endpoint = process.env.AMD_ENDPOINT || "";
    this.model = process.env.AMD_MODEL || "Qwen/Qwen2.5-72B-Instruct";

    if (!this.endpoint) {
      throw new Error("AMD_ENDPOINT is required when PROVIDER=amd");
    }
  }

  async complete(systemPrompt: string, userPrompt: string, _options?: ModelOptions): Promise<string> {
    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AMD provider error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("AMD provider returned empty content");
    }
    return content;
  }
}
