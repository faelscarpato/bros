import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WindowState } from "../context/WindowManagerContext";
import { useWindowManager } from "../context/WindowManagerContext";

const MIN_W = 360;
const MIN_H = 240;

export function Window({ win, children }: { win: WindowState; children: ReactNode }) {
  const { focus, close, minimize, toggleMaximize, move, resize, focusId } = useWindowManager();
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; w: number; h: number; x: number; y: number; dir: string } | null>(null);
  const [active, setActive] = useState(focusId === win.id);
  useEffect(() => setActive(focusId === win.id), [focusId, win.id]);

  function onMouseDownHeader(e: React.MouseEvent) {
    if (win.state === "maximized") return;
    focus(win.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y };
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      move(win.id, Math.max(0, d.origX + ev.clientX - d.startX), Math.max(0, d.origY + ev.clientY - d.startY));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResize(dir: string) {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      if (win.state === "maximized") return;
      focus(win.id);
      resizeRef.current = { startX: e.clientX, startY: e.clientY, w: win.width, h: win.height, x: win.x, y: win.y, dir };
      const onMove = (ev: MouseEvent) => {
        const r = resizeRef.current; if (!r) return;
        const dx = ev.clientX - r.startX;
        const dy = ev.clientY - r.startY;
        let { w, h, x, y } = r;
        if (dir.includes("e")) w = Math.max(MIN_W, r.w + dx);
        if (dir.includes("s")) h = Math.max(MIN_H, r.h + dy);
        if (dir.includes("w")) { w = Math.max(MIN_W, r.w - dx); x = r.x + (r.w - w); }
        if (dir.includes("n")) { h = Math.max(MIN_H, r.h - dy); y = r.y + (r.h - h); }
        resize(win.id, w, h, x, y);
      };
      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
  }

  if (win.state === "minimized") return null;

  return (
    <div
      onMouseDown={() => focus(win.id)}
      className={`absolute glass window-shadow flex flex-col overflow-hidden rounded-2xl transition-shadow ${active ? "ring-1 ring-primary/40" : ""}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }}
    >
      <header
        onMouseDown={onMouseDownHeader}
        onDoubleClick={() => toggleMaximize(win.id)}
        className="flex h-9 shrink-0 cursor-grab items-center gap-2 border-b border-[color:var(--glass-border)] px-3 active:cursor-grabbing"
      >
        <div className="flex gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); close(win.id); }} aria-label="fechar" className="h-3 w-3 rounded-full bg-[oklch(0.65_0.23_25)] hover:opacity-80" />
          <button onClick={(e) => { e.stopPropagation(); minimize(win.id); }} aria-label="minimizar" className="h-3 w-3 rounded-full bg-[oklch(0.86_0.16_95)] hover:opacity-80" />
          <button onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} aria-label="maximizar" className="h-3 w-3 rounded-full bg-[oklch(0.72_0.17_150)] hover:opacity-80" />
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs font-medium text-foreground/90">
          <span className="opacity-70">{win.icon}</span>
          <span>{win.title}</span>
        </div>
        <div className="w-12" />
      </header>
      <div className="min-h-0 flex-1">{children}</div>

      {/* Resize handles */}
      {win.state !== "maximized" && (
        <>
          <div onMouseDown={startResize("e")} className="absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize" />
          <div onMouseDown={startResize("w")} className="absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize" />
          <div onMouseDown={startResize("s")} className="absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize" />
          <div onMouseDown={startResize("n")} className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize" />
          <div onMouseDown={startResize("se")} className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize" />
          <div onMouseDown={startResize("sw")} className="absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize" />
          <div onMouseDown={startResize("ne")} className="absolute top-0 right-0 h-3 w-3 cursor-nesw-resize" />
          <div onMouseDown={startResize("nw")} className="absolute top-0 left-0 h-3 w-3 cursor-nwse-resize" />
        </>
      )}
    </div>
  );
}