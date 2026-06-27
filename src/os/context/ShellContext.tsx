import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useBreakpoint, type Breakpoint } from "../hooks/useBreakpoint";

type Theme = "dark" | "light";

interface Toast {
  id: string;
  title: string;
  message?: string;
  variant?: "default" | "warning" | "error" | "success";
}

interface ShellContextValue {
  theme: Theme;
  toggleTheme: () => void;
  breakpoint: Breakpoint;
  toasts: Toast[];
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const Ctx = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("bros.theme") as Theme) || "dark";
  });
  const breakpoint = useBreakpoint();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("bros.theme", theme);
  }, [theme]);

  const notify = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((s) => [...s, { ...t, id }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 5000);
  }, []);
  const dismiss = useCallback((id: string) => setToasts((s) => s.filter((x) => x.id !== id)), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo<ShellContextValue>(
    () => ({ theme, toggleTheme, breakpoint, toasts, notify, dismiss }),
    [theme, toggleTheme, breakpoint, toasts, notify, dismiss],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShell() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShell must be used inside ShellProvider");
  return v;
}