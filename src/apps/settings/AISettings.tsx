import { useState } from "react";
import { useAIConfig } from "@/os/context/AIConfigContext";
import { useShell } from "@/os/context/ShellContext";
import type { AuthType, Provider } from "@/os/ai/types";

function empty(): Provider {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    baseUrl: "https://",
    authType: "bearer",
    apiKey: "",
    models: [],
    defaultModel: "",
  };
}

export function AISettings() {
  const { providers, upsertProvider, deleteProvider, defaultProviderId, setDefaultProvider } = useAIConfig();
  const { notify } = useShell();
  const [editing, setEditing] = useState<Provider | null>(null);
  const [modelsText, setModelsText] = useState("");

  function startEdit(p: Provider) {
    setEditing({ ...p });
    setModelsText(p.models.join("\n"));
  }
  function startNew() {
    const p = empty();
    setEditing(p);
    setModelsText("");
  }
  function save() {
    if (!editing) return;
    const models = modelsText.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    const next: Provider = {
      ...editing,
      models,
      defaultModel: editing.defaultModel && models.includes(editing.defaultModel) ? editing.defaultModel : (models[0] ?? ""),
    };
    if (!next.name || !next.baseUrl) {
      notify({ title: "Campos obrigatórios", message: "Nome e URL base são necessários.", variant: "warning" });
      return;
    }
    upsertProvider(next);
    setEditing(null);
    notify({ title: "Provider salvo", variant: "success" });
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="flex flex-col border-r border-[color:var(--glass-border)]">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-sm font-semibold">Providers</h3>
          <button onClick={startNew} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">+ Novo</button>
        </div>
        <div className="flex-1 space-y-1 overflow-auto px-2 pb-2">
          {providers.map((p) => (
            <button key={p.id} onClick={() => startEdit(p)} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${editing?.id === p.id ? "bg-secondary" : "hover:bg-secondary/60"}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name || "(sem nome)"}</span>
                {defaultProviderId === p.id && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">padrão</span>}
              </div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{p.baseUrl}</div>
              {!p.apiKey && <div className="text-[10px] text-yellow-400">sem chave</div>}
            </button>
          ))}
        </div>
      </aside>
      <section className="overflow-auto p-4">
        {editing ? (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <h2 className="text-base font-semibold">Configurar provider</h2>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Nome</span>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-md bg-secondary p-2 text-sm outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Base URL (ex.: https://api.openai.com/v1)</span>
              <input value={editing.baseUrl} onChange={(e) => setEditing({ ...editing, baseUrl: e.target.value })} className="rounded-md bg-secondary p-2 text-sm outline-none" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">Autenticação</span>
                <select value={editing.authType} onChange={(e) => setEditing({ ...editing, authType: e.target.value as AuthType })} className="rounded-md bg-secondary p-2 text-sm outline-none">
                  <option value="bearer">Bearer (Authorization)</option>
                  <option value="x-api-key">x-api-key</option>
                  <option value="none">Nenhuma</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">API Key</span>
                <input type="password" value={editing.apiKey} onChange={(e) => setEditing({ ...editing, apiKey: e.target.value })} className="rounded-md bg-secondary p-2 text-sm outline-none" placeholder="sk-..." />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Modelos (um por linha)</span>
              <textarea value={modelsText} onChange={(e) => setModelsText(e.target.value)} className="min-h-[120px] resize-none rounded-md bg-secondary p-2 font-mono text-xs outline-none" style={{ fontFamily: "var(--font-mono)" }} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Modelo padrão</span>
              <input value={editing.defaultModel} onChange={(e) => setEditing({ ...editing, defaultModel: e.target.value })} className="rounded-md bg-secondary p-2 text-sm outline-none" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Salvar</button>
              <button onClick={() => setEditing(null)} className="rounded-md bg-secondary px-4 py-2 text-sm">Cancelar</button>
              {providers.some((p) => p.id === editing.id) && (
                <>
                  <button onClick={() => setDefaultProvider(editing.id)} className="rounded-md bg-accent px-4 py-2 text-sm text-accent-foreground">Definir como padrão</button>
                  <button onClick={() => { deleteProvider(editing.id); setEditing(null); }} className="ml-auto rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground">Excluir</button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-xl space-y-3 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">IA Settings</h2>
            <p>Configure provedores compatíveis com a API <code>/chat/completions</code> (OpenAI, Groq, Together, Mistral, etc.).</p>
            <p>Suas chaves ficam salvas localmente no seu navegador (localStorage). Elas nunca saem do seu dispositivo a não ser para o endpoint que você configurou.</p>
            <p>Selecione um provider à esquerda para editar, ou crie um novo.</p>
          </div>
        )}
      </section>
    </div>
  );
}