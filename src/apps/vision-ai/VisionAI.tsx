import { useEffect, useState } from "react";
import { AppShell } from "../_shared/AppShell";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import { callAI } from "@/os/ai/engine";

const APP_ID = "vision-ai";
const STORE = "bros.vision.history.v1";

interface Item {
  id: string;
  prompt: string;
  concept: string;
  style: string;
  createdAt: number;
}

export function VisionAI() {
  const { getProviderForApp } = useAIConfig();
  const { notify } = useShell();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("editorial moderno");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(STORE) || "[]")); } catch { /* noop */ }
  }, []);
  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(items)); }, [items]);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    const { provider, model } = getProviderForApp(APP_ID);
    const r = await callAI(provider, {
      model,
      messages: [
        { role: "system", content: "Você é um diretor de arte. Gere um conceito visual detalhado e um prompt otimizado para modelos de imagem (Midjourney/Stable Diffusion), em português. Estruture: Conceito, Composição, Cores, Iluminação, Prompt Final." },
        { role: "user", content: `Tema: ${prompt}\nEstilo: ${style}` },
      ],
      maxTokens: 800,
    });
    setLoading(false);
    if (!r.ok) { notify({ title: "Erro", message: r.error, variant: "error" }); return; }
    const item: Item = { id: Math.random().toString(36).slice(2), prompt, concept: r.text, style, createdAt: Date.now() };
    setItems((s) => [item, ...s].slice(0, 30));
    setSelected(item);
  }

  return (
    <AppShell appId={APP_ID}>
      <div className="grid h-full grid-cols-1 gap-3 p-3 md:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-lg bg-secondary/40 p-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="ex: paisagem brasileira ao entardecer..." className="min-h-[80px] resize-none rounded-md bg-card/60 p-2 text-sm outline-none" />
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estilo</label>
            <input value={style} onChange={(e) => setStyle(e.target.value)} className="rounded-md bg-card/60 p-2 text-sm outline-none" />
            <button onClick={generate} disabled={loading} className="mt-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "Gerando conceito..." : "Gerar conceito"}</button>
            <p className="text-[10px] text-muted-foreground">Geração de imagem requer um provider compatível. Este app entrega conceito + prompt otimizado.</p>
          </div>
          <div className="flex-1 overflow-auto rounded-lg bg-secondary/40 p-2">
            <h4 className="px-1 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Galeria</h4>
            <div className="grid grid-cols-2 gap-2">
              {items.map((it) => (
                <button key={it.id} onClick={() => setSelected(it)} className="aspect-square rounded-md p-2 text-left text-[10px] [background:var(--gradient-br)] text-black/80 hover:opacity-90">
                  <div className="line-clamp-4 font-medium">{it.prompt}</div>
                </button>
              ))}
              {items.length === 0 && <p className="col-span-2 px-1 text-xs text-muted-foreground">Sem itens ainda.</p>}
            </div>
          </div>
        </aside>
        <section className="rounded-lg border border-[color:var(--glass-border)] bg-card/60 p-4 overflow-auto">
          {selected ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-lg [background:var(--gradient-br)]" />
              <h2 className="text-lg font-semibold">{selected.prompt}</h2>
              <p className="text-xs text-muted-foreground">{selected.style}</p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{selected.concept}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione um item ou gere um novo conceito visual.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}