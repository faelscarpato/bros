import { useState } from "react";
import { AppShell } from "../_shared/AppShell";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import { callAI } from "@/os/ai/engine";

const APP_ID = "code-ai";

const ACTIONS = {
  gerar: "Gere o código solicitado. Retorne APENAS o código em um bloco markdown:",
  explicar: "Explique linha a linha o que o código abaixo faz, em português:",
  refatorar: "Refatore o código abaixo para legibilidade e boas práticas. Retorne o código refatorado e um pequeno comentário do que mudou:",
};

export function CodeAI() {
  const { getProviderForApp } = useAIConfig();
  const { notify } = useShell();
  const [code, setCode] = useState("// descreva o que você quer ou cole código aqui\n");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState<keyof typeof ACTIONS | null>(null);

  async function run(action: keyof typeof ACTIONS) {
    if (!code.trim()) return;
    setLoading(action);
    const { provider, model } = getProviderForApp(APP_ID);
    const r = await callAI(provider, {
      model,
      messages: [
        { role: "system", content: "Você é um assistente de programação sênior. Use markdown e blocos de código." },
        { role: "user", content: `${ACTIONS[action]}\n\n\`\`\`\n${code}\n\`\`\`` },
      ],
      maxTokens: 2048,
    });
    setLoading(null);
    if (!r.ok) {
      notify({ title: "Erro", message: r.error, variant: "error" });
      return;
    }
    setOutput(r.text);
  }

  return (
    <AppShell
      appId={APP_ID}
      toolbar={
        <>
          {(Object.keys(ACTIONS) as Array<keyof typeof ACTIONS>).map((k) => (
            <button
              key={k}
              onClick={() => run(k)}
              disabled={!!loading}
              className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading === k ? "..." : k}
            </button>
          ))}
        </>
      }
    >
      <div className="grid h-full grid-cols-1 gap-3 p-3 md:grid-cols-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-full min-h-[200px] resize-none rounded-lg bg-secondary p-3 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <pre className="h-full min-h-[200px] overflow-auto rounded-lg border border-[color:var(--glass-border)] bg-card/60 p-3 font-mono text-xs whitespace-pre-wrap" style={{ fontFamily: "var(--font-mono)" }}>
          {output || "// resposta da IA aparece aqui"}
        </pre>
      </div>
    </AppShell>
  );
}