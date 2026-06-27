import { useEffect, useRef, useState } from "react";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { callAI } from "@/os/ai/engine";

const APP_ID = "terminal-ai";

interface Line { kind: "in" | "out" | "err"; text: string }

export function TerminalAI() {
  const { getProviderForApp } = useAIConfig();
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: "BrOS Terminal IA — digite um comando ou pergunta. (`help` para dicas)" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollTo({ top: 999999 }); }, [lines, busy]);

  async function submit() {
    if (!input.trim() || busy) return;
    const cmd = input;
    setInput("");
    setLines((l) => [...l, { kind: "in", text: cmd }]);
    if (cmd.trim() === "help") {
      setLines((l) => [...l, { kind: "out", text: "Você pode pedir explicações de comandos, gerar scripts, simular saídas. Ex: `explique tar -xzvf` ou `gere um bash que renomeia .jpg para .png`" }]);
      return;
    }
    if (cmd.trim() === "clear") { setLines([]); return; }
    setBusy(true);
    const { provider, model } = getProviderForApp(APP_ID);
    const r = await callAI(provider, {
      model,
      messages: [
        { role: "system", content: "Você é um terminal explicativo. Não execute nada de verdade. Responda de forma concisa, em texto monoespaçado, simulando saída quando aplicável." },
        { role: "user", content: cmd },
      ],
    });
    setBusy(false);
    if (!r.ok) setLines((l) => [...l, { kind: "err", text: r.error }]);
    else setLines((l) => [...l, { kind: "out", text: r.text }]);
  }

  return (
    <div className="flex h-full flex-col bg-[oklch(0.1_0.02_250)] p-3 font-mono text-xs text-green-300" style={{ fontFamily: "var(--font-mono)" }}>
      <div ref={ref} className="flex-1 space-y-1 overflow-auto">
        {lines.map((l, i) => (
          <div key={i} className={l.kind === "err" ? "text-red-400" : l.kind === "in" ? "text-yellow-200" : "text-green-200"}>
            <span className="opacity-60">{l.kind === "in" ? "$ " : "  "}</span>
            <span className="whitespace-pre-wrap">{l.text}</span>
          </div>
        ))}
        {busy && <div className="text-green-200 opacity-70">  processando…</div>}
      </div>
      <div className="mt-2 flex items-center gap-2 border-t border-green-900 pt-2">
        <span className="text-yellow-300">$</span>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="flex-1 bg-transparent text-green-100 outline-none" autoFocus />
      </div>
    </div>
  );
}