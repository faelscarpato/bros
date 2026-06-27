import { useShell } from "../context/ShellContext";

const variantClass: Record<string, string> = {
  default: "border-[color:var(--glass-border)]",
  warning: "border-[oklch(0.86_0.16_95)]/60",
  error: "border-[oklch(0.65_0.23_25)]/60",
  success: "border-[oklch(0.72_0.17_150)]/60",
};

export function NotificationToast() {
  const { toasts, dismiss } = useShell();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`glass window-shadow pointer-events-auto rounded-xl border p-3 text-sm ${variantClass[t.variant ?? "default"]}`}>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              {t.message && <div className="mt-1 text-xs text-muted-foreground">{t.message}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}