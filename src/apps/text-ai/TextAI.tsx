import { useState } from "react";
import { AppShell } from "../_shared/AppShell";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import { callAI } from "@/os/ai/engine";

const APP_ID = "text-ai";

const PROMPTS = {
  resumir: "Resuma o seguinte texto em até 5 bullet points objetivos:",
  revisar: "Revise o texto a seguir, corrigindo gramática, clareza e fluidez. Retorne apenas o texto corrigido:",
  traduzir: "Traduza o texto a seguir para inglês mantendo o tom:",
  expandir: "Expanda o texto a seguir, mantendo o sentido e adicionando exemplos:",
};

export function TextAI() {
  const { getProviderForApp } = useAIConfig();
  const { notify } = useShell();
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState<keyof typeof PROMPTS | null>(null);
  const [history, setHistory] = useState<Array<{ action: string; output: string }>>([]);

  async function run(action: keyof typeof PROMPTS) {
    if (!text.trim()) {
      notify({ title: "Sem texto", message: "Digite algum conteúdo antes.", variant: "warning" });
      return;
    }
    setLoading(action);
    const { provider, model } = getProviderForApp(APP_ID);
    const r = await callAI(provider, {
      model,
      messages: [
        { role: "system", content: "Você é um assistente de escrita preciso, conciso e em português brasileiro quando aplicável." },
        { role: "user", content: `${PROMPTS[action]}\n\n---\n${text}` },
      ],
    });
    setLoading(null);
    if (!r.ok) {
      notify({ title: "Erro", message: r.error, variant: "error" });
      return;
    }
    setOutput(r.text);
    setHistory((h) => [{ action, output: r.text }, ...h].slice(0, 10));
  }

  return (
    <AppShell
      appId={APP_ID}
      toolbar={
        <>
          {(Object.keys(PROMPTS) as Array<keyof typeof PROMPTS>).map((k) => (
            <button
              key={k}
              onClick={() => run(k)}
              disabled={!!loading}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading === k ? "..." : k}
            </button>
          ))}
        </>
      }
    >
      <div className="grid h-full grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_320px]">
        <div className="flex min-h-[200px] flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite ou cole seu texto aqui..."
            className="min-h-[140px] flex-1 resize-none rounded-lg bg-secondary p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          {output && (
            <div className="max-h-[40%] overflow-auto rounded-lg border border-[color:var(--glass-border)] bg-card/60 p-3 text-sm whitespace-pre-wrap">
              {output}
            </div>
          )}
        </div>
        <aside className="flex flex-col gap-2 rounded-lg bg-secondary/40 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Histórico</h3>
          <div className="flex-1 space-y-2 overflow-auto">
            {history.length === 0 && <p className="text-xs text-muted-foreground">Suas interações aparecerão aqui.</p>}
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setOutput(h.output)}
                className="block w-full rounded-md bg-card/60 p-2 text-left text-xs hover:bg-card"
              >
                <div className="font-medium text-foreground">{h.action}</div>
                <div className="line-clamp-2 text-muted-foreground">{h.output}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}