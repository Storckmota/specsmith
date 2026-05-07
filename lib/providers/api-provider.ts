import type { AiProvider } from "./mock-provider";

const REQUEST_TIMEOUT_MS = 90_000; // 90 seconds — generous for long specs

export class ApiProvider implements AiProvider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = (process.env.API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    this.model = process.env.API_MODEL || "gpt-4o";
    this.apiKey = process.env.API_KEY || "";

    if (!this.apiKey) {
      throw new Error(
        "API_KEY is required when PROVIDER=api. Set it in .env.local. " +
        "Switch to PROVIDER=mock to run without a key."
      );
    }
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(
          `API provider request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
        );
      }
      throw new Error(
        `API provider network error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      // Try to surface the API error body without leaking the key
      let detail = "";
      try {
        const body = await response.json();
        detail = body?.error?.message ?? body?.message ?? "";
      } catch {
        // ignore parse errors
      }
      throw new Error(
        `API provider error ${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`
      );
    }

    const data = await response.json();
    const content: unknown = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("API provider returned empty or missing content");
    }

    return content;
  }
}
