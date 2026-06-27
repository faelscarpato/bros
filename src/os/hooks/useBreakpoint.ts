import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

function compute(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(compute);
  useEffect(() => {
    const onResize = () => setBp(compute());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}