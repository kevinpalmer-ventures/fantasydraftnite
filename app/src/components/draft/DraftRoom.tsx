// The interactive demo draft room (manager view). Simulated locally: nine AI
// managers plus you. Snake and auction share the same engine.
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { POS_COLORS, PLAYERS, TEAM_COUNT, ROSTER_SIZE, type Position } from "../../lib/draft/data";
import {
  currentActorId,
  gradeTeams,
  maxBid,
  player,
  snakeTeamForPick,
  userTeam,
  type DraftState,
  type DraftAction,
  type Team,
} from "../../lib/draft/engine";
import { useDraftSim, useNow } from "../../lib/draft/useDraftSim";

const POSITIONS: (Position | "ALL")[] = ["ALL", "QB", "RB", "WR", "TE", "K", "DST"];

function clockText(msLeft: number): string {
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  return `0:${s.toString().padStart(2, "0")}`;
}

function PosTag({ pos }: { pos: Position }) {
  return (
    <span
      className="inline-block w-9 shrink-0 rounded-[3px] text-center font-chyron text-[10px] font-semibold leading-4 text-pitch"
      style={{ backgroundColor: POS_COLORS[pos] }}
    >
      {pos}
    </span>
  );
}

export function DraftRoom({ mode }: { mode: "snake" | "auction" }) {
  const { state, dispatch } = useDraftSim(mode, false);
  const now = useNow(state.status === "live");
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<Position | "ALL">("ALL");
  const [bidInput, setBidInput] = useState("");
  const [mobileTab, setMobileTab] = useState<"room" | "players" | "queue" | "teams">("room");

  const me = userTeam(state);
  const actorId = currentActorId(state);
  const msLeft = state.status === "paused" ? state.timerTotal : state.deadline - now;
  const myTurn = state.mode === "snake" ? snakeTeamForPick(state.overall) === me?.id : !state.lot && state.nomPointer === me?.id;
  const lot = state.lot;
  const lotPlayer = lot ? player(lot.playerId) : null;
  const iLead = lot && me ? lot.leaderId === me.id : false;
  const myMax = me ? maxBid(me) : 0;
  const minNext = lot ? lot.highBid + 1 : 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.available
      .map((id) => player(id))
      .filter((p) => (posFilter === "ALL" || p.pos === posFilter) && (q === "" || p.name.toLowerCase().includes(q) || p.team.toLowerCase() === q))
      .slice(0, 40);
  }, [state.available, search, posFilter]);

  const lastFive = useMemo(() => {
    const events: { text: string; key: number }[] = [];
    for (let i = state.log.length - 1; i >= 0 && events.length < 5; i--) {
      const e = state.log[i];
      if (e.kind === "pick" || e.kind === "sale") events.push({ text: e.text, key: e.id });
    }
    return events;
  }, [state.log]);

  const act = (a: DraftAction) => dispatch(a);

  function placeBid(amount: number) {
    act({ type: "userBid", amount, now: Date.now() });
    setBidInput("");
  }

  if (state.status === "complete") {
    return <Results state={state} />;
  }

  const clockDanger = msLeft < 6000;

  return (
    <div className="flex min-h-dvh flex-col bg-pitch font-display text-chalk">
      {/* room header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 hairline md:px-6">
        <Link to="/" className="font-display text-sm font-bold tracking-tight text-chalk transition-opacity hover:opacity-70">
          Fantasy Draft Nite
        </Link>
        <span className="rounded-[3px] bg-pitch-3 px-2 py-0.5 font-chyron text-[10px] uppercase tracking-wider text-mist">
          {state.mode} demo
        </span>
        <span className="hidden font-chyron text-[10px] uppercase tracking-wider text-mist md:inline">10 teams · $200 budgets</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/tv"
            className="rounded-[3px] border px-2.5 py-1 font-chyron text-[10px] uppercase tracking-wider text-mist transition-colors hairline hover:border-chalk hover:text-chalk"
          >
            TV board
          </Link>
          <button
            onClick={() => act({ type: "togglePause", now: Date.now() })}
            className="rounded-[3px] border border-scarlet/60 px-2.5 py-1 font-chyron text-[10px] uppercase tracking-wider text-chalk transition-colors hover:bg-scarlet/20 active:scale-[0.97]"
          >
            {state.status === "paused" ? "Resume" : "Pause"}
          </button>
        </div>
      </header>

      {/* clock strip */}
      <div className="border-b bg-pitch-2 hairline">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            {state.mode === "snake" ? (
              <>
                <p className="font-chyron text-[10px] uppercase tracking-wider text-mist">
                  Round {Math.floor(state.overall / TEAM_COUNT) + 1} · Pick {(state.overall % TEAM_COUNT) + 1} · On the clock
                </p>
                <p className="truncate text-lg font-bold leading-tight md:text-2xl">
                  {state.teams[actorId].name}
                  {state.teams[actorId].isUser && <span className="ml-2 text-scarlet">(you)</span>}
                </p>
                <p className="truncate font-chyron text-[11px] text-mist">
                  Next: {state.teams[snakeTeamForPick(Math.min(state.overall + 1, TEAM_COUNT * ROSTER_SIZE - 1))].name}
                </p>
              </>
            ) : lot && lotPlayer ? (
              <>
                <p className="font-chyron text-[10px] uppercase tracking-wider text-mist">
                  On the block{lot.snipeStage > 0 && <span className="ml-2 text-scarlet">snipe window ×{lot.snipeStage}</span>}
                </p>
                <p className="truncate text-lg font-bold leading-tight md:text-2xl">
                  {lotPlayer.name} <span className="text-sm font-medium text-mist">{lotPlayer.pos} · {lotPlayer.team}</span>
                </p>
                <p className="truncate font-chyron text-[11px] text-mist">
                  ${lot.highBid} to {state.teams[lot.leaderId].name}
                  {iLead && <span className="ml-2 font-semibold text-scarlet">you are winning</span>}
                </p>
              </>
            ) : (
              <>
                <p className="font-chyron text-[10px] uppercase tracking-wider text-mist">Nominating</p>
                <p className="truncate text-lg font-bold leading-tight md:text-2xl">
                  {state.teams[state.nomPointer].name}
                  {state.teams[state.nomPointer].isUser && <span className="ml-2 text-scarlet">(you)</span>}
                </p>
                <p className="truncate font-chyron text-[11px] text-mist">Pick a player below to put on the block</p>
              </>
            )}
          </div>
          <div className="text-right">
            <p
              className={`font-chyron text-4xl font-semibold tabular-nums leading-none md:text-5xl ${clockDanger ? "text-scarlet" : "text-chalk"}`}
            >
              {state.status === "paused" ? "PAUSED" : clockText(msLeft)}
            </p>
            <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-pitch-3 md:w-40">
              <div
                className={`h-full rounded-full ${clockDanger ? "bg-scarlet" : "bg-chalk/60"}`}
                style={{ width: `${Math.max(0, Math.min(100, (msLeft / state.timerTotal) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* auction bid rail */}
      {state.mode === "auction" && lot && me && !me.finished && (
        <div className="border-b bg-pitch-2/60 hairline">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 md:px-6">
            {[1, 5, 10].map((inc) => {
              const amount = lot.highBid + inc;
              const legal = !iLead && amount <= myMax && state.status === "live";
              return (
                <button
                  key={inc}
                  disabled={!legal}
                  onClick={() => placeBid(amount)}
                  className="rounded-[3px] bg-scarlet px-4 py-2 font-chyron text-sm font-semibold text-chalk transition-transform enabled:hover:bg-scarlet-deep enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +${inc}
                </button>
              );
            })}
            <div className="flex items-center gap-2">
              <label htmlFor="bid" className="sr-only">
                Custom bid amount
              </label>
              <input
                id="bid"
                inputMode="numeric"
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value.replace(/\D/g, ""))}
                placeholder={`$${minNext}+`}
                className="w-20 rounded-[3px] border bg-pitch px-2 py-2 font-chyron text-sm text-chalk placeholder:text-mist/50 hairline focus:border-scarlet focus:outline-none"
              />
              <button
                disabled={iLead || bidInput === "" || Number(bidInput) < minNext || Number(bidInput) > myMax || state.status !== "live"}
                onClick={() => placeBid(Number(bidInput))}
                className="rounded-[3px] border border-scarlet px-3 py-2 font-chyron text-sm font-semibold text-scarlet transition-colors enabled:hover:bg-scarlet enabled:hover:text-chalk enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Place bid
              </button>
            </div>
            <p className="ml-auto font-chyron text-[11px] text-mist">
              Budget ${me.budget} · Max bid ${myMax}
            </p>
          </div>
        </div>
      )}

      {/* mobile tabs */}
      <nav className="flex border-b hairline md:hidden" aria-label="Room sections">
        {(["room", "players", "queue", "teams"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 py-2.5 font-chyron text-[11px] uppercase tracking-wider transition-colors ${mobileTab === t ? "border-b-2 border-scarlet text-chalk" : "text-mist"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* main grid */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr] md:px-6">
        {/* players */}
        <section className={`${mobileTab === "players" ? "" : "hidden"} min-w-0 md:block`} aria-label="Available players">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="sr-only">
              Search players
            </label>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players"
              className="w-full rounded-[3px] border bg-pitch-2 px-3 py-2 text-sm text-chalk placeholder:text-mist/60 hairline focus:border-scarlet focus:outline-none"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPosFilter(p)}
                className={`rounded-[3px] px-2 py-1 font-chyron text-[10px] uppercase tracking-wider transition-colors ${posFilter === p ? "bg-chalk text-pitch" : "bg-pitch-3 text-mist hover:text-chalk"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <ul className="mt-3 divide-y divide-chalk/10 border-t hairline">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2">
                <span className="w-7 shrink-0 font-chyron text-[11px] text-mist">{p.rank}</span>
                <PosTag pos={p.pos} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="font-chyron text-[10px] text-mist">
                    {p.team} · bye {p.bye} · ${p.value}
                  </p>
                </div>
                <button
                  onClick={() => act({ type: "queueAdd", playerId: p.id })}
                  disabled={state.queue.includes(p.id)}
                  aria-label={`Queue ${p.name}`}
                  className="rounded-[3px] border px-2 py-1 font-chyron text-[10px] uppercase text-mist transition-colors hairline enabled:hover:border-chalk enabled:hover:text-chalk disabled:opacity-30"
                >
                  +Q
                </button>
                {state.mode === "snake" ? (
                  <button
                    onClick={() => act({ type: "userPick", playerId: p.id, now: Date.now() })}
                    disabled={!myTurn || state.status !== "live"}
                    className="rounded-[3px] bg-scarlet px-3 py-1 font-chyron text-[11px] font-semibold uppercase text-chalk transition-transform enabled:hover:bg-scarlet-deep enabled:active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    Draft
                  </button>
                ) : (
                  <button
                    onClick={() => act({ type: "userNominate", playerId: p.id, openingBid: 1, now: Date.now() })}
                    disabled={!myTurn || state.status !== "live"}
                    className="rounded-[3px] bg-scarlet px-2.5 py-1 font-chyron text-[11px] font-semibold uppercase text-chalk transition-transform enabled:hover:bg-scarlet-deep enabled:active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    Nom
                  </button>
                )}
              </li>
            ))}
            {filtered.length === 0 && <li className="py-6 text-center font-chyron text-xs text-mist">No available players match.</li>}
          </ul>
        </section>

        {/* room feed */}
        <section className={`${mobileTab === "room" ? "" : "hidden"} min-w-0 md:block`} aria-label="Room activity">
          <h2 className="font-chyron text-[10px] uppercase tracking-wider text-mist">Last five</h2>
          <ul className="mt-2 space-y-1.5">
            {lastFive.map((e) => (
              <li key={e.key} className="rounded-[3px] bg-pitch-2 px-3 py-2 font-chyron text-[11px] leading-snug text-chalk/90">
                {e.text}
              </li>
            ))}
            {lastFive.length === 0 && <li className="font-chyron text-[11px] text-mist">No picks yet. The board is clean.</li>}
          </ul>
          <h2 className="mt-5 font-chyron text-[10px] uppercase tracking-wider text-mist">Activity log</h2>
          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
            {[...state.log].reverse().map((e) => (
              <li key={e.id} className={`font-chyron text-[11px] leading-snug ${e.kind === "system" ? "text-mist" : e.kind === "sale" ? "text-scarlet" : "text-chalk/80"}`}>
                {e.text}
              </li>
            ))}
          </ul>
        </section>

        {/* my side */}
        <section className={`${mobileTab === "queue" || mobileTab === "teams" ? "" : "hidden"} min-w-0 md:block`} aria-label="Your roster and queue">
          <div className={mobileTab === "teams" ? "hidden md:block" : ""}>
            <h2 className="font-chyron text-[10px] uppercase tracking-wider text-mist">
              My queue <span className="text-mist/60">(auto-draft order)</span>
            </h2>
            <ul className="mt-2 space-y-1">
              {state.queue.map((id, i) => {
                const p = player(id);
                return (
                  <li key={id} className="flex items-center gap-2 rounded-[3px] bg-pitch-2 px-2 py-1.5">
                    <span className="w-4 font-chyron text-[10px] text-mist">{i + 1}</span>
                    <PosTag pos={p.pos} />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{p.name}</span>
                    <button aria-label={`Move ${p.name} up`} onClick={() => act({ type: "queueMove", playerId: id, dir: -1 })} className="px-1 text-mist hover:text-chalk">
                      ↑
                    </button>
                    <button aria-label={`Move ${p.name} down`} onClick={() => act({ type: "queueMove", playerId: id, dir: 1 })} className="px-1 text-mist hover:text-chalk">
                      ↓
                    </button>
                    <button aria-label={`Remove ${p.name} from queue`} onClick={() => act({ type: "queueRemove", playerId: id })} className="px-1 text-mist hover:text-scarlet">
                      ×
                    </button>
                  </li>
                );
              })}
              {state.queue.length === 0 && <li className="font-chyron text-[11px] text-mist">Empty. Tap +Q on players you want auto-drafted first.</li>}
            </ul>
          </div>

          <div className={`mt-5 ${mobileTab === "teams" ? "" : "hidden md:block"}`}>
            <h2 className="font-chyron text-[10px] uppercase tracking-wider text-mist">Rosters</h2>
            <TeamRosters state={state} />
          </div>
        </section>
      </main>
    </div>
  );
}

function TeamRosters({ state }: { state: DraftState }) {
  const [open, setOpen] = useState(state.teams.find((t) => t.isUser)?.id ?? 0);
  return (
    <ul className="mt-2 space-y-1">
      {state.teams.map((t) => (
        <li key={t.id} className="rounded-[3px] bg-pitch-2">
          <button
            onClick={() => setOpen(open === t.id ? -1 : t.id)}
            aria-expanded={open === t.id}
            className="flex w-full items-center gap-2 px-3 py-2 text-left"
          >
            <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${t.isUser ? "text-scarlet" : "text-chalk"}`}>{t.name}</span>
            {state.mode === "auction" && <span className="font-chyron text-[10px] text-mist">${t.budget}</span>}
            <span className="font-chyron text-[10px] text-mist">
              {t.roster.length}/{ROSTER_SIZE}
            </span>
          </button>
          {open === t.id && (
            <ul className="border-t px-3 py-2 hairline">
              {t.roster.map((r) => {
                const p = player(r.playerId);
                return (
                  <li key={r.playerId} className="flex items-center gap-2 py-1">
                    <PosTag pos={p.pos} />
                    <span className="min-w-0 flex-1 truncate text-xs">{p.name}</span>
                    <span className="font-chyron text-[10px] text-mist">{r.price !== undefined ? `$${r.price}` : `R${r.round}`}</span>
                  </li>
                );
              })}
              {t.roster.length === 0 && <li className="py-1 font-chyron text-[10px] text-mist">No players yet</li>}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function Results({ state }: { state: DraftState }) {
  const grades = gradeTeams(state);
  const ordered = [...state.teams].sort(
    (a, b) => (grades.find((g) => g.teamId === b.id)?.score ?? 0) - (grades.find((g) => g.teamId === a.id)?.score ?? 0),
  );
  return (
    <div className="min-h-dvh bg-pitch px-4 py-10 font-display text-chalk md:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="font-chyron text-[10px] uppercase tracking-wider text-scarlet">Draft complete · board locked</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tighter md:text-5xl">Draft grades</h1>
        <p className="mt-2 max-w-[65ch] text-mist">
          Every result below is now immutable, exactly like a real room: no undo, no edits, grades visible to the whole league.
        </p>
        <ul className="mt-8 divide-y divide-chalk/10 border-y hairline">
          {ordered.map((t) => {
            const g = grades.find((x) => x.teamId === t.id);
            return <GradeRow key={t.id} team={t} grade={g?.grade ?? "C"} note={g?.note ?? ""} mode={state.mode} />;
          })}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/demo"
            className="rounded-[3px] bg-scarlet px-5 py-3 font-chyron text-sm font-semibold uppercase tracking-wide text-chalk transition-transform hover:bg-scarlet-deep active:scale-[0.97]"
          >
            Run it again
          </Link>
          <Link to="/" className="group font-chyron text-sm text-mist transition-colors hover:text-chalk">
            Back to the site <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function GradeRow({ team, grade, note, mode }: { team: Team; grade: string; note: string; mode: "snake" | "auction" }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-4 py-4 text-left">
        <span className="w-12 font-chyron text-3xl font-semibold text-scarlet">{grade}</span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-base font-bold ${team.isUser ? "text-scarlet" : ""}`}>{team.name}</span>
          <span className="block font-chyron text-[11px] text-mist">{note}</span>
        </span>
        <span className="font-chyron text-[11px] text-mist">{open ? "hide" : "roster"}</span>
      </button>
      {open && (
        <ul className="grid grid-cols-1 gap-x-6 pb-4 sm:grid-cols-2">
          {team.roster.map((r) => {
            const p = player(r.playerId);
            return (
              <li key={r.playerId} className="flex items-center gap-2 py-0.5">
                <PosTag pos={p.pos} />
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="font-chyron text-[11px] text-mist">{mode === "auction" ? `$${r.price ?? 0}` : `R${r.round}`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
