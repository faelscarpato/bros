export function Desktop() {
  return (
    <>
      <div className="fixed inset-0 -z-10" style={{ background: "var(--gradient-desktop)" }} />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]" style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }} />
    </>
  );
}