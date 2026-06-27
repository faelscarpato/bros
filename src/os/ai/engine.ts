import type { AICallOptions, AIResult, Provider } from "./types";

/**
 * AI Engine — single client-side entrypoint used by every BrOS app.
 * Supports OpenAI-compatible /chat/completions providers (OpenAI, Groq, etc.).
 * To add a new provider TYPE: extend authType in types.ts and headers below.
 */
export async function callAI(provider: Provider | undefined, opts: AICallOptions): Promise<AIResult> {
  if (!provider) return { ok: false, error: "Nenhum provider de IA selecionado. Abra IA Settings." };
  if (!provider.baseUrl) return { ok: false, error: "Provider sem baseUrl configurado." };
  if (provider.authType !== "none" && !provider.apiKey) {
    return { ok: false, error: `Provider "${provider.name}" sem chave de API.` };
  }

  const url = provider.baseUrl.replace(/\/$/, "") + "/chat/completions";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider.authType === "bearer") headers["Authorization"] = `Bearer ${provider.apiKey}`;
  if (provider.authType === "x-api-key") headers["x-api-key"] = provider.apiKey;

  const body = {
    model: opts.model ?? provider.defaultModel,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1024,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) {
        return { ok: false, code: 429, error: "Este provider atingiu o limite de uso. Tente novamente em instantes ou selecione outro." };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, code: res.status, error: "Falha de autenticação. Verifique sua chave de API em IA Settings." };
      }
      return { ok: false, code: res.status, error: `Erro ${res.status}: ${text.slice(0, 240) || res.statusText}` };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; text?: string }>;
    };
    const text =
      json.choices?.[0]?.message?.content ??
      json.choices?.[0]?.text ??
      "";
    return { ok: true, text, raw: json };
  } catch (e) {
    if ((e as Error).name === "AbortError") return { ok: false, error: "Requisição cancelada." };
    return { ok: false, error: `Falha de rede: ${(e as Error).message}` };
  }
}