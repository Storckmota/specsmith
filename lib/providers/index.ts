import { MockProvider } from "./mock-provider";
import { ApiProvider } from "./api-provider";
import { AmdProvider } from "./amd-provider";

export type { AiProvider } from "./mock-provider";

export function getProvider() {
  const mode = process.env.PROVIDER || "mock";

  switch (mode) {
    case "api":
      return { provider: new ApiProvider(), mode: "API mode" };
    case "amd":
      return { provider: new AmdProvider(), mode: "AMD/Qwen mode" };
    case "mock":
    default:
      return { provider: new MockProvider(), mode: "Mock mode" };
  }
}
