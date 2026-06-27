import { createFileRoute } from "@tanstack/react-router";
import { BrOS } from "@/os/BrOS";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BrOS — Web OS IA-nativo" },
      { name: "description", content: "Sistema operacional web IA-nativo com Window Manager, Dock e apps configuráveis." },
    ],
  }),
  component: Index,
});

function Index() {
  return <BrOS />;
}
