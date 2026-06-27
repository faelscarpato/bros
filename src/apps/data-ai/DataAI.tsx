import { useMemo, useState } from "react";
import { AppShell } from "../_shared/AppShell";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import { callAI } from "@/os/ai/engine";

const APP_ID = "data-ai";

const SAMPLE = `produto,vendas,regiao
Açaí,1200,Norte
Café,3400,Sudeste
Pão de queijo,2100,Sudeste
Tapioca,800,Nordeste
Guaraná,1500,Norte`;

function parseCSV(text: string): string[][] {
  return text.trim().split(/\r?\n/).map((line) => line.split(","));
}

export function DataAI() {
  const { getProviderForApp } = useAIConfig();
  const { notify } = useShell();
  const [csv, setCsv] = useState(SAMPLE);
  const [question, setQuestion] = useState("Quais insights principais destes dados?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => parseCSV(csv), [csv]);
  const header = rows[0] || [];
  const body = rows.slice(1);

  async function ask() {
    setLoading(true);
    const { provider, model } = getProviderForApp(APP_ID);
    const r = await callAI(provider, {
      model,
      messages: [
        { role: "system", content: "Você é um analista de dados. Responda em português, com bullets, insights numéricos e sugestões." },
        { role: "user", content: `Dados CSV:\n${csv}\n\nPergunta: ${question}` },
      ],
      maxTokens: 1200,
    });
    setLoading(false);
    if (!r.ok) { notify({ title: "Erro", message: r.error, variant: "error" }); return; }
    setAnswer(r.text);
  }

  return (
    <AppShell appId={APP_ID}>
      <div className="grid h-full grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="h-32 resize-none rounded-md bg-secondary p-2 font-mono text-xs outline-none" style={{ fontFamily: "var(--font-mono)" }} />
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[color:var(--glass-border)] bg-card/60">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr>{header.map((h, i) => <th key={i} className="px-2 py-1 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((row, i) => (
                  <tr key={i} className="border-t border-[color:var(--glass-border)]">
                    {row.map((c, j) => <td key={j} className="px-2 py-1">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex gap-2">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} className="flex-1 rounded-md bg-secondary p-2 text-sm outline-none" />
            <button onClick={ask} disabled={loading} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "..." : "Perguntar"}</button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[color:var(--glass-border)] bg-card/60 p-3 text-sm whitespace-pre-wrap">
            {answer || "A resposta aparecerá aqui."}
          </div>
        </div>
      </div>
    </AppShell>
  );
}