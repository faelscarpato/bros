import type { ReactNode } from "react";
import { useAIConfig } from "@/os/context/AIConfigContext";

interface Props {
  appId: string;
  toolbar?: ReactNode;
  children: ReactNode;
  showProviderPicker?: boolean;
}

export function AppShell({ appId, toolbar, children, showProviderPicker = true }: Props) {
  const { providers, getProviderForApp, setAppSelection } = useAIConfig();
  const { provider, model } = getProviderForApp(appId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {(showProviderPicker || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--glass-border)] px-3 py-2 text-xs">
          {showProviderPicker && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">IA:</span>
              <select
                className="rounded-md bg-secondary px-2 py-1 text-foreground outline-none"
                value={provider?.id ?? ""}
                onChange={(e) => {
                  const p = providers.find((x) => x.id === e.target.value);
                  if (p) setAppSelection(appId, { providerId: p.id, model: p.defaultModel });
                }}
              >
                {providers.length === 0 && <option value="">— sem provider —</option>}
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {provider && (
                <select
                  className="rounded-md bg-secondary px-2 py-1 text-foreground outline-none"
                  value={model}
                  onChange={(e) => setAppSelection(appId, { providerId: provider.id, model: e.target.value })}
                >
                  {provider.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">{toolbar}</div>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}