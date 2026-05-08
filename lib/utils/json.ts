function debugPreview(s: string, len: number): string {
  return process.env.DEBUG_AGENT_OUTPUT === "true" ? ` Preview: ${s.slice(0, len)}` : "";
}

export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  // Strip markdown code fences: ```json\n...\n``` or ```\n...\n```
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/m);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    try {
      return JSON.parse(inner);
    } catch {
      // Fence stripped but inner content still not valid JSON — fall through
    }
  }

  // Try direct parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // Try extracting from first { or [ (handles leading prose)
  const objectStart = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");

  const jsonStart =
    objectStart === -1
      ? arrayStart
      : arrayStart === -1
      ? objectStart
      : Math.min(objectStart, arrayStart);

  if (jsonStart !== -1) {
    try {
      return JSON.parse(trimmed.slice(jsonStart));
    } catch {
      // fall through
    }
  }

  throw new Error(
    `Failed to parse JSON from model output.${debugPreview(trimmed, 400)}`
  );
}
