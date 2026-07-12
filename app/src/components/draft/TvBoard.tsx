// Read-only TV presentation view: a self-running draft that fills the board
// while the chyron, ticker and player-card takeover do the broadcast work.
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { POS_COLORS, ROSTER_SIZE, TEAM_COUNT } from "../../lib/draft/data";
import { currentActorId, player, snakeTeamForPick, type DraftState } from "../../lib/draft/engine";
import { useDraftSim, useNow } from "../../lib/draft/useDraftSim";

function clockText(msLeft: number): string {
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  return `0:${s.toString().padStart(2, "0")}`;
}

export function TvBoard() {
  const { state } = useDraftSim("snake", true);
  const now = useNow(state.status === "live");
  const msLeft = state.deadline - now;
  const actorId = currentActorId(state);
  const rounds = Math.min(ROSTER_SIZE, Math.floor(state.overall / TEAM_COUNT) + 3);

  return (
    <div className="flex min-h-dvh flex-col bg-pitch font-display text-chalk">
      {/* chyron */}
      <header className="flex items-center gap-3 border-b bg-pitch-2 px-4 py-3 hairline md:px-8">
        <span className="flex items-center gap-2 font-chyron text-[11px] uppercase tracking-widest text-scarlet">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-scarlet opacity-75 fdr-motion" />
            <span className="relative h-2 w-2 rounded-full bg-scarlet" />
          </span>
          Live
        </span>
        <h1 className="truncate text-sm font-bold uppercase tracking-wide md:text-lg">League Night · Demo Broadcast</h1>
        <div className="ml-auto flex items-center gap-4">
          {state.status === "complete" ? (
            <span className="font-chyron text-sm uppercase text-scarlet">Board locked</span>
          ) : (
            <>
              <span className="hidden font-chyron text-[11px] uppercase tracking-wider text-mist md:inline">
                On the clock: {state.teams[actorId].name}
              </span>
              <span className={`font-chyron text-2xl font-semibold tabular-nums md:text-3xl ${msLeft < 6000 ? "text-scarlet" : ""}`}>
                {clockText(msLeft)}
              </span>
            </>
          )}
          <Link
            to="/demo"
            className="rounded-[3px] border px-2.5 py-1 font-chyron text-[10px] uppercase tracking-wider text-mist transition-colors hairline hover:border-chalk hover:text-chalk"
          >
            Exit TV
          </Link>
        </div>
      </header>

      {/* board */}
      <div className="flex-1 overflow-x-auto px-4 py-4 md:px-8">
        <table className="w-full min-w-[900px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-10" aria-label="Round" />
              {state.teams.map((t) => (
                <th
                  key={t.id}
                  className={`truncate px-1 pb-1 font-chyron text-[10px] font-medium uppercase tracking-wide ${t.id === actorId && state.status !== "complete" ? "text-scarlet" : "text-mist"}`}
                >
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rounds }, (_, r) => (
              <tr key={r}>
                <td className="pr-1 text-right font-chyron text-[10px] text-mist">R{r + 1}</td>
                {state.teams.map((t, colIdx) => {
                  const entry = t.roster[r];
                  const isActive = state.status !== "complete" && r === Math.floor(state.overall / TEAM_COUNT) && colIdx === actorId;
                  if (!entry)
                    return (
                      <td key={t.id} className={`h-11 rounded-[3px] ${isActive ? "animate-pulse bg-scarlet/25 fdr-motion" : "bg-pitch-2"}`} />
                    );
                  const p = player(entry.playerId);
                  return (
                    <td key={t.id} className="h-11 rounded-[3px] px-1.5" style={{ backgroundColor: `${POS_COLORS[p.pos]}26`, borderLeft: `3px solid ${POS_COLORS[p.pos]}` }}>
                      <p className="truncate text-[11px] font-bold leading-tight">{p.name}</p>
                      <p className="font-chyron text-[9px] text-mist">
                        {p.pos} · {p.team}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pick takeover */}
      <PickTakeover state={state} />

      {/* ticker */}
      <footer className="border-t bg-pitch-2 hairline">
        <div className="flex items-center gap-6 overflow-hidden px-4 py-2.5 md:px-8">
          <span className="shrink-0 font-chyron text-[10px] uppercase tracking-widest text-scarlet">Last picks</span>
          <div className="flex min-w-0 gap-8 overflow-hidden">
            {state.log
              .filter((e) => e.kind === "pick")
              .slice(-5)
              .reverse()
              .map((e) => (
                <span key={e.id} className="shrink-0 truncate font-chyron text-[11px] text-chalk/85">
                  {e.text}
                </span>
              ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function PickTakeover({ state }: { state: DraftState }) {
  const [shown, setShown] = useState<number | null>(null);
  const ev = state.lastEvent;

  useEffect(() => {
    if (!ev) return;
    setShown(ev.seq);
    const t = window.setTimeout(() => setShown((s) => (s === ev.seq ? null : s)), 5000);
    return () => window.clearTimeout(t);
  }, [ev]);

  if (!ev || shown !== ev.seq) return null;
  const p = player(ev.playerId);
  const team = state.teams[ev.teamId];
  return (
    <button
      onClick={() => setShown(null)}
      aria-label="Dismiss pick card"
      className="fixed bottom-16 left-1/2 z-20 flex w-[min(480px,90vw)] -translate-x-1/2 items-center gap-4 rounded-[6px] border-l-4 bg-pitch-3 px-5 py-4 text-left shadow-2xl shadow-black/50"
      style={{ borderColor: POS_COLORS[p.pos] }}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] font-chyron text-sm font-bold text-pitch"
        style={{ backgroundColor: POS_COLORS[p.pos] }}
      >
        {p.pos}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xl font-bold leading-tight">{p.name}</span>
        <span className="block font-chyron text-[11px] text-mist">
          {p.team} · bye {p.bye} · rank {p.rank}
        </span>
        <span className="block truncate font-chyron text-[11px] text-scarlet">
          {ev.kind === "sale" ? `Sold to ${team.name} for $${ev.price}` : `Selected by ${team.name}`}
        </span>
      </span>
    </button>
  );
}
