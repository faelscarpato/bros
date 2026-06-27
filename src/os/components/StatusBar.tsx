import { useEffect, useState } from "react";
import { useShell } from "../context/ShellContext";
import { useAIConfig } from "../context/AIConfigContext";
import { useWindowManager } from "../context/WindowManagerContext";

export function StatusBar() {
  const { theme, toggleTheme } = useShell();
  const { providers, defaultProviderId, hasConfiguredProvider } = useAIConfig();
  const { openApp } = useWindowManager();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const def = providers.find((p) => p.id === defaultProviderId);
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-8 items-center gap-3 px-3 text-xs">
      <div className="glass flex h-7 items-center gap-2 rounded-full px-3 font-semibold">
        <span className="text-gradient-br">BrOS</span>
      </div>
      <div className="glass hidden h-7 items-center gap-2 rounded-full px-3 sm:flex">
        <span className={`h-1.5 w-1.5 rounded-full ${hasConfiguredProvider ? "bg-[oklch(0.72_0.17_150)]" : "bg-[oklch(0.86_0.16_95)]"}`} />
        <span className="opacity-80">{def?.name ?? "sem provider"}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => openApp("settings", { title: "IA Settings", icon: "⚙" })} className="glass h-7 rounded-full px-3 hover:opacity-90">⚙ IA</button>
        <button onClick={toggleTheme} className="glass h-7 rounded-full px-3 hover:opacity-90" aria-label="toggle theme">{theme === "dark" ? "☾" : "☀"}</button>
        <div className="glass h-7 rounded-full px-3 leading-7 tabular-nums">{time}</div>
      </div>
    </div>
  );
}