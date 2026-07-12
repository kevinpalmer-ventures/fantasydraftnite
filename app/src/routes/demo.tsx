import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { ClientOnly } from "../components/client-only";
import { DraftRoom } from "../components/draft/DraftRoom";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo draft room · Fantasy Draft Room" },
      { name: "description", content: "Run a live mock draft against nine AI managers. Snake or auction, real clock, real rules." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [mode, setMode] = useState<"snake" | "auction" | null>(null);

  if (mode) {
    return (
      <ClientOnly fallback={<RoomShell />}>
        <DraftRoom mode={mode} />
      </ClientOnly>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-pitch px-4 font-display text-chalk">
      <img
        src="/assets/hero-stage-a.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/70 to-pitch/40" aria-hidden />
      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="font-chyron text-[11px] uppercase tracking-widest text-scarlet">Demo room · no sign-up</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter md:text-5xl">Pick your format</h1>
        <p className="mx-auto mt-3 max-w-md text-mist">
          Ten teams, nine AI managers, one seat for you. The clock, the queue and the anti-snipe rules all behave like the real room.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode("snake")}
            className="group border border-chalk/30 bg-pitch/70 px-6 py-8 text-left backdrop-blur-sm transition-colors hover:border-chalk active:translate-y-[1px]"
          >
            <span className="block font-display text-2xl font-bold uppercase tracking-tight">Snake</span>
            <span className="mt-2 block text-sm text-mist">Order reverses every round. Pick fast, queue smarter.</span>
            <span className="mt-4 block font-chyron text-xs uppercase tracking-widest text-scarlet transition-transform group-hover:translate-x-1">
              Start →
            </span>
          </button>
          <button
            onClick={() => setMode("auction")}
            className="group border border-scarlet/60 bg-scarlet/10 px-6 py-8 text-left backdrop-blur-sm transition-colors hover:border-scarlet active:translate-y-[1px]"
          >
            <span className="block font-display text-2xl font-bold uppercase tracking-tight">Auction</span>
            <span className="mt-2 block text-sm text-mist">$200 budget, live bids, snipe at your own risk.</span>
            <span className="mt-4 block font-chyron text-xs uppercase tracking-widest text-scarlet transition-transform group-hover:translate-x-1">
              Start →
            </span>
          </button>
        </div>
        <Link to="/" className="mt-10 inline-block font-chyron text-xs text-mist transition-colors hover:text-chalk">
          ← Back to the site
        </Link>
      </div>
    </div>
  );
}

function RoomShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-pitch font-chyron text-sm text-mist">
      Opening the room…
    </div>
  );
}
