export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const url = new URL(window.location.href);
  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const isPreviewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovableproject-dev.com") ||
    host.endsWith(".beta.lovable.dev");
  const wantsOff = url.searchParams.get("sw") === "off";

  if (!import.meta.env.PROD || inIframe || isPreviewHost || wantsOff) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => {
        if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister().catch(() => undefined);
      });
    });
    return;
  }
  navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}