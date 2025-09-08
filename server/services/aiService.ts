import { env } from "../config/env";

export async function generateAIResponses(subject: string, snippet: string): Promise<string[]> {
  if (!env.OPENROUTER_API_KEY) {
    return fallbackSuggestions(subject, snippet);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL || "openrouter/auto",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that drafts short, actionable email suggestions based on the provided subject and snippet. Return 3 concise suggestions, each 1-2 sentences, tailored to the context.",
          },
          {
            role: "user",
            content: `Subject: ${subject}\nSnippet: ${snippet}\n\nGenerate 3 concise response suggestions as a JSON array of strings.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
    const data = (await response.json()) as any;
    const text: string = data.choices?.[0]?.message?.content || "";

    // Try to parse a JSON object with an array field or direct array
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return normalize(parsed, subject, snippet);
      const arr = parsed.suggestions || parsed.items || parsed.responses;
      if (Array.isArray(arr)) return normalize(arr, subject, snippet);
    } catch {
      /* fallthrough */
    }

    // Fallback: split by lines
    const lines = text
      .split(/\n+/)
      .map((l: string) => l.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    if (lines.length) return normalize(lines, subject, snippet);

    return fallbackSuggestions(subject, snippet);
  } catch {
    return fallbackSuggestions(subject, snippet);
  }
}

function normalize(items: string[], subject: string, snippet: string): string[] {
  const base = `Subject: ${subject}\n${snippet}`;
  return items.map((s) => `${s}\n\n${base}`);
}

export function fallbackSuggestions(subject: string, snippet: string): string[] {
  const base = `Subject: ${subject}\n${snippet}`;
  return [
    "Thanks for reaching out—here are next steps and a quick plan.",
    "I can meet this week; sharing a few time windows that could work.",
    "Appreciate the update—let’s align on details and confirm the path forward.",
  ].map((s) => `${s}\n\n${base}`);
}
