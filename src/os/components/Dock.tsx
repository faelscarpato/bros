import { APPS } from "../registry/apps";
import { useWindowManager } from "../context/WindowManagerContext";
import { useShell } from "../context/ShellContext";

const accentClass: Record<string, string> = {
  green: "from-[oklch(0.72_0.17_150)] to-[oklch(0.62_0.16_180)]",
  blue: "from-[oklch(0.65_0.16_240)] to-[oklch(0.55_0.18_270)]",
  yellow: "from-[oklch(0.86_0.16_95)] to-[oklch(0.78_0.16_70)]",
  neutral: "from-[oklch(0.4_0.02_250)] to-[oklch(0.28_0.02_250)]",
};

export function Dock() {
  const { windows, openApp, focus } = useWindowManager();
  const { breakpoint } = useShell();
  const isDesktop = breakpoint === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "pointer-events-none fixed left-3 top-1/2 z-40 -translate-y-1/2"
          : "pointer-events-none fixed bottom-3 left-1/2 z-40 -translate-x-1/2"
      }
    >
      <div className={`glass window-shadow pointer-events-auto flex gap-2 rounded-2xl p-2 ${isDesktop ? "flex-col" : "flex-row"}`}>
        {APPS.map((app) => {
          const open = windows.find((w) => w.appId === app.id);
          return (
            <button
              key={app.id}
              title={app.name}
              onClick={() => (open ? focus(open.id) : openApp(app.id, { title: app.name, icon: app.icon, width: app.defaultSize?.width, height: app.defaultSize?.height }))}
              className={`group relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-base font-bold text-black/85 shadow-md transition-transform hover:scale-110 ${accentClass[app.accent]}`}
            >
              <span aria-hidden>{app.icon}</span>
              {open && (
                <span className={`absolute ${isDesktop ? "right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-2" : "bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-2"} rounded-full bg-foreground/80`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}