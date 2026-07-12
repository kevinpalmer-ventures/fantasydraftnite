import { createFileRoute } from "@tanstack/react-router";

import { ClientOnly } from "../components/client-only";
import { TvBoard } from "../components/draft/TvBoard";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "TV board · Fantasy Draft Room" },
      { name: "description", content: "The read-only television presentation: a synchronized draft board, ticker and player cards." },
    ],
  }),
  component: TvPage,
});

function TvPage() {
  return (
    <ClientOnly
      fallback={<div className="flex min-h-dvh items-center justify-center bg-pitch font-chyron text-sm text-mist">Tuning the broadcast…</div>}
    >
      <TvBoard />
    </ClientOnly>
  );
}
