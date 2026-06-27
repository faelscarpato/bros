import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type WindowStateName = "normal" | "minimized" | "maximized";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string; // emoji or short text
  x: number;
  y: number;
  width: number;
  height: number;
  prev?: { x: number; y: number; width: number; height: number };
  state: WindowStateName;
  z: number;
}

interface OpenOptions {
  title?: string;
  icon?: string;
  width?: number;
  height?: number;
}

interface WMValue {
  windows: WindowState[];
  focusId: string | null;
  openApp: (appId: string, opts?: OpenOptions) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, width: number, height: number, x?: number, y?: number) => void;
}

const Ctx = createContext<WMValue | null>(null);

let zCounter = 10;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const focus = useCallback((id: string) => {
    zCounter += 1;
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, z: zCounter, state: w.state === "minimized" ? "normal" : w.state } : w)),
    );
    setFocusId(id);
  }, []);

  const openApp = useCallback(
    (appId: string, opts?: OpenOptions) => {
      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        focus(existing.id);
        return existing.id;
      }
      zCounter += 1;
      const id = `${appId}-${Date.now()}`;
      const width = opts?.width ?? 880;
      const height = opts?.height ?? 560;
      const margin = 80;
      const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;
      const x = Math.max(margin, Math.min(winW - width - margin, margin + windows.length * 30));
      const y = Math.max(margin, Math.min(winH - height - margin, margin + windows.length * 30));
      const w: WindowState = {
        id,
        appId,
        title: opts?.title ?? appId,
        icon: opts?.icon ?? "•",
        x,
        y,
        width,
        height,
        state: "normal",
        z: zCounter,
      };
      setWindows((ws) => [...ws, w]);
      setFocusId(id);
      return id;
    },
    [windows, focus],
  );

  const close = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setFocusId((f) => (f === id ? null : f));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, state: "minimized" } : w)));
    setFocusId((f) => (f === id ? null : f));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        if (w.state === "maximized" && w.prev) {
          return { ...w, ...w.prev, prev: undefined, state: "normal" };
        }
        const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const winH = typeof window !== "undefined" ? window.innerHeight : 800;
        return {
          ...w,
          prev: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 12,
          y: 48,
          width: winW - 96,
          height: winH - 120,
          state: "maximized",
        };
      }),
    );
  }, []);

  const move = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resize = useCallback((id: string, width: number, height: number, x?: number, y?: number) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id ? { ...w, width, height, x: x ?? w.x, y: y ?? w.y } : w,
      ),
    );
  }, []);

  const value = useMemo<WMValue>(
    () => ({ windows, focusId, openApp, close, focus, minimize, toggleMaximize, move, resize }),
    [windows, focusId, openApp, close, focus, minimize, toggleMaximize, move, resize],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWindowManager() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWindowManager must be used inside WindowManagerProvider");
  return v;
}