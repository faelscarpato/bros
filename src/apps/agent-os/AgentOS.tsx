import { useEffect, useRef, useState } from "react";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import { callAI } from "@/os/ai/engine";
import type { Agent, ChatMessage } from "@/os/ai/types";

const APP_ID = "agent-os";

function emptyAgent(providerId: string, model: string): Agent {
  return {
    id: Math.random().toString(36).slice(2),
    name: "Novo agente",
    description: "",
    providerId,
    model,
    systemPrompt: "Você é um assistente especializado. Responda em português, com clareza.",
    temperature: 0.7,
  };
}

export function AgentOS() {
  const { agents, providers, upsertAgent, deleteAgent, defaultProviderId } = useAIConfig();
  const { notify } = useShell();
  const [selectedId, setSelectedId] = useState<string | null>(agents[0]?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId && agents[0]) setSelectedId(agents[0].id);
  }, [agents, selectedId]);

  const selected = agents.find((a) => a.id === selectedId);
  const provider = providers.find((p) => p.id === selected?.providerId);

  function startNew() {
    const p = providers.find((x) => x.id === defaultProviderId) ?? providers[0];
    if (!p) { notify({ title: "Configure um provider antes", variant: "warning" }); return; }
    setDraft(emptyAgent(p.id, p.defaultModel));
    setEditing(true);
  }

  function startEdit() {
    if (selected) { setDraft({ ...selected }); setEditing(true); }
  }

  function save() {
    if (!draft) return;
    upsertAgent(draft);
    setSelectedId(draft.id);
    setEditing(false);
    setDraft(null);
  }

  async function send() {
    if (!selected || !input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    const history = messages[selected.id] ?? [];
    const next = [...history, userMsg];
    setMessages((m) => ({ ...m, [selected.id]: next }));
    setInput("");
    setLoading(true);
    const r = await callAI(provider, {
      model: selected.model,
      temperature: selected.temperature,
      messages: [{ role: "system", content: selected.systemPrompt }, ...next],
    });
    setLoading(false);
    if (!r.ok) {
      notify({ title: "Erro", message: r.error, variant: "error" });
      return;
    }
    setMessages((m) => ({ ...m, [selected.id]: [...next, { role: "assistant", content: r.text }] }));
    setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 50);
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r border-[color:var(--glass-border)]">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-sm font-semibold">Agentes</h3>
          <button onClick={startNew} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">+ Novo</button>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-2">
          {agents.length === 0 && <p className="px-2 text-xs text-muted-foreground">Crie seu primeiro agente.</p>}
          {agents.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)} className={`mb-1 block w-full rounded-md px-3 py-2 text-left text-sm transition ${selectedId === a.id ? "bg-secondary" : "hover:bg-secondary/60"}`}>
              <div className="font-medium">{a.name}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{a.description || "sem descrição"}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        {editing && draft ? (
          <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
            <h3 className="text-sm font-semibold">{agents.some((a) => a.id === draft.id) ? "Editar agente" : "Novo agente"}</h3>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nome" className="rounded-md bg-secondary p-2 text-sm outline-none" />
            <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Descrição" className="rounded-md bg-secondary p-2 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={draft.providerId} onChange={(e) => { const p = providers.find((x) => x.id === e.target.value); setDraft({ ...draft, providerId: e.target.value, model: p?.defaultModel ?? draft.model }); }} className="rounded-md bg-secondary p-2 text-sm outline-none">
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} className="rounded-md bg-secondary p-2 text-sm outline-none">
                {providers.find((p) => p.id === draft.providerId)?.models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <textarea value={draft.systemPrompt} onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })} placeholder="Instruções (system prompt)" className="min-h-[140px] resize-none rounded-md bg-secondary p-2 text-sm outline-none" />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Temperatura: {draft.temperature.toFixed(2)}
              <input type="range" min={0} max={1.5} step={0.05} value={draft.temperature} onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })} className="flex-1" />
            </label>
            <div className="flex gap-2">
              <button onClick={save} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Salvar</button>
              <button onClick={() => { setEditing(false); setDraft(null); }} className="rounded-md bg-secondary px-3 py-2 text-sm">Cancelar</button>
              {agents.some((a) => a.id === draft.id) && (
                <button onClick={() => { deleteAgent(draft.id); setEditing(false); setDraft(null); setSelectedId(null); }} className="ml-auto rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground">Excluir</button>
              )}
            </div>
          </div>
        ) : selected ? (
          <>
            <div className="flex items-center justify-between border-b border-[color:var(--glass-border)] px-4 py-2">
              <div>
                <div className="text-sm font-semibold">{selected.name}</div>
                <div className="text-xs text-muted-foreground">{provider?.name} · {selected.model}</div>
              </div>
              <button onClick={startEdit} className="rounded-md bg-secondary px-3 py-1 text-xs">Editar</button>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-4">
              {(messages[selected.id] ?? []).map((m, i) => (
                <div key={i} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.content}</div>
              ))}
              {(messages[selected.id] ?? []).length === 0 && <p className="text-xs text-muted-foreground">Inicie uma conversa com {selected.name}.</p>}
              {loading && <div className="bg-secondary rounded-2xl px-3 py-2 text-sm">…</div>}
            </div>
            <div className="flex gap-2 border-t border-[color:var(--glass-border)] p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Mensagem..." className="flex-1 rounded-md bg-secondary p-2 text-sm outline-none" />
              <button onClick={send} disabled={loading} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Enviar</button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">Selecione ou crie um agente.</div>
        )}
      </section>
    </div>
  );
}