import type { AiProvider } from "./mock-provider";

export class ApiProvider implements AiProvider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || "https://api.openai.com/v1";
    this.model = process.env.API_MODEL || "gpt-4o";
    this.apiKey = process.env.API_KEY || "";
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
    });

    if (!response.ok) {
      throw new Error(`API provider error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("API provider returned empty content");
    }
    return content;
  }
}
