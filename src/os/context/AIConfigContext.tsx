import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Agent, AppModelSelection, Provider } from "../ai/types";

const STORAGE_KEY = "bros.aiconfig.v1";

interface PersistedState {
  providers: Provider[];
  agents: Agent[];
  appSelection: Record<string, AppModelSelection>;
  defaultProviderId: string | null;
}

const DEFAULT_STATE: PersistedState = {
  providers: [
    {
      id: "groq-example",
      name: "Groq (exemplo)",
      baseUrl: "https://api.groq.com/openai/v1",
      authType: "bearer",
      apiKey: "",
      models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
      defaultModel: "llama-3.3-70b-versatile",
    },
    {
      id: "openai-example",
      name: "OpenAI (exemplo)",
      baseUrl: "https://api.openai.com/v1",
      authType: "bearer",
      apiKey: "",
      models: ["gpt-4o-mini", "gpt-4o"],
      defaultModel: "gpt-4o-mini",
    },
  ],
  agents: [],
  appSelection: {},
  defaultProviderId: "groq-example",
};

interface AIConfigContextValue extends PersistedState {
  upsertProvider: (p: Provider) => void;
  deleteProvider: (id: string) => void;
  upsertAgent: (a: Agent) => void;
  deleteAgent: (id: string) => void;
  setAppSelection: (appId: string, sel: AppModelSelection) => void;
  setDefaultProvider: (id: string) => void;
  getProviderForApp: (appId: string) => { provider: Provider | undefined; model: string };
  hasConfiguredProvider: boolean;
}

const Ctx = createContext<AIConfigContextValue | null>(null);

function load(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, hydrated]);

  const value = useMemo<AIConfigContextValue>(() => {
    const upsertProvider = (p: Provider) =>
      setState((s) => {
        const idx = s.providers.findIndex((x) => x.id === p.id);
        const providers = idx >= 0 ? s.providers.map((x, i) => (i === idx ? p : x)) : [...s.providers, p];
        return { ...s, providers, defaultProviderId: s.defaultProviderId ?? p.id };
      });
    const deleteProvider = (id: string) =>
      setState((s) => ({
        ...s,
        providers: s.providers.filter((p) => p.id !== id),
        defaultProviderId: s.defaultProviderId === id ? (s.providers.find((p) => p.id !== id)?.id ?? null) : s.defaultProviderId,
      }));
    const upsertAgent = (a: Agent) =>
      setState((s) => {
        const idx = s.agents.findIndex((x) => x.id === a.id);
        const agents = idx >= 0 ? s.agents.map((x, i) => (i === idx ? a : x)) : [...s.agents, a];
        return { ...s, agents };
      });
    const deleteAgent = (id: string) => setState((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id) }));
    const setAppSelection = (appId: string, sel: AppModelSelection) =>
      setState((s) => ({ ...s, appSelection: { ...s.appSelection, [appId]: sel } }));
    const setDefaultProvider = (id: string) => setState((s) => ({ ...s, defaultProviderId: id }));

    const getProviderForApp = (appId: string) => {
      const sel = state.appSelection[appId];
      const provId = sel?.providerId ?? state.defaultProviderId;
      const provider = state.providers.find((p) => p.id === provId);
      const model = sel?.model ?? provider?.defaultModel ?? "";
      return { provider, model };
    };

    const hasConfiguredProvider = state.providers.some((p) => p.apiKey && p.baseUrl);

    return {
      ...state,
      upsertProvider,
      deleteProvider,
      upsertAgent,
      deleteAgent,
      setAppSelection,
      setDefaultProvider,
      getProviderForApp,
      hasConfiguredProvider,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAIConfig() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAIConfig must be used inside AIConfigProvider");
  return v;
}