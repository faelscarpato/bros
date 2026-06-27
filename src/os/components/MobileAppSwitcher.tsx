import { APPS } from "../registry/apps";
import { useWindowManager } from "../context/WindowManagerContext";

export function MobileAppSwitcher() {
  const { windows, focusId, openApp, close } = useWindowManager();
  const activeWindow = windows.find((w) => w.id === focusId) ?? windows[windows.length - 1];
  const app = activeWindow ? APPS.find((a) => a.id === activeWindow.appId) : null;
  const Comp = app?.component;

  if (!app || !Comp) {
    return (
      <div className="absolute inset-0 top-8 bottom-20 grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gradient-br">Bem-vindo ao BrOS</h1>
          <p className="mt-2 text-sm text-muted-foreground">Toque um app na barra inferior para começar.</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {APPS.slice(0, 6).map((a) => (
              <button key={a.id} onClick={() => openApp(a.id, { title: a.name, icon: a.icon })} className="glass rounded-xl p-3">
                <div className="text-2xl">{a.icon}</div>
                <div className="mt-1 text-xs">{a.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-2 top-10 bottom-20 glass window-shadow flex flex-col overflow-hidden rounded-2xl">
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-[color:var(--glass-border)] px-3 text-xs">
        <span>{app.icon}</span>
        <span className="font-semibold">{app.name}</span>
        <button onClick={() => close(activeWindow.id)} className="ml-auto rounded-full bg-destructive/80 px-2 py-0.5 text-[10px] text-destructive-foreground">fechar</button>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Comp />
      </div>
    </div>
  );
}