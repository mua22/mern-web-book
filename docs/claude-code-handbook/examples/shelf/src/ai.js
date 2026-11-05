// Adding an LLM feature safely: build the prompt, call a *injected* completion function,
// validate the output like untrusted input, and fall back instead of failing the request.

const GENRES = ["fiction", "non-fiction", "science", "history", "biography", "technology", "other"];

/** Real completion function using the Anthropic Messages API (needs ANTHROPIC_API_KEY). */
export function anthropicComplete({ apiKey = process.env.ANTHROPIC_API_KEY, model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5", fetchImpl = fetch } = {}) {
  return async (prompt, { maxTokens = 300 } = {}) => {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
    const data = await res.json();
    return data.content?.filter((b) => b.type === "text").map((b) => b.text).join("") ?? "";
  };
}

/** Classify a book into one genre. Always returns a valid genre (falls back to "other"). */
export async function classifyGenre(complete, book, log = () => {}) {
  const prompt =
    `Classify the book into exactly one genre from: ${GENRES.join(", ")}.\n` +
    `Reply with only the genre word.\nTitle: ${JSON.stringify(book.title)}\nAuthor: ${JSON.stringify(book.author)}`;
  try {
    const raw = (await complete(prompt, { maxTokens: 10 })).trim().toLowerCase().replace(/[^a-z-]/g, "");
    if (GENRES.includes(raw)) return { genre: raw, source: "ai" };
    log("ai: unexpected output, using fallback", raw);
  } catch (err) {
    log("ai: call failed, using fallback", err.message);
  }
  return { genre: "other", source: "fallback" };
}

/** Summarise reading notes in <= maxWords words; output is length-checked before use. */
export async function summarizeNotes(complete, notes, { maxWords = 40 } = {}, log = () => {}) {
  const clean = String(notes ?? "").trim();
  if (!clean) return { summary: "", source: "empty" };
  const prompt = `Summarise these reading notes in at most ${maxWords} words. Plain text only.\n\nNOTES:\n${clean.slice(0, 4000)}`;
  try {
    const raw = (await complete(prompt, { maxTokens: 120 })).trim();
    const words = raw.split(/\s+/);
    if (raw && words.length <= maxWords * 1.5) return { summary: raw, source: "ai" };
    log("ai: summary rejected (length)", words.length);
  } catch (err) {
    log("ai: call failed, using fallback", err.message);
  }
  // Fallback: first sentence, trimmed — less clever but always safe.
  const first = clean.split(/(?<=[.!?])\s/)[0].split(/\s+/).slice(0, maxWords).join(" ");
  return { summary: first, source: "fallback" };
}

export { GENRES };
