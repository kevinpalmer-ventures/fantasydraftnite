// Landing sections S2 to S7, built to the reference boards in /refs.
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { joinWaitlist } from "../../lib/api/waitlist.functions";

/* Generated icon sheet: 4x2 grid, 1376x768. Rendered as a CSS sprite. */
const SHEET_SCALE = 40 / 344; // display cell width / source cell width
const SHEET_W = 1376 * SHEET_SCALE;
const SHEET_H = 768 * SHEET_SCALE;
const CELL_W = 40;
const CELL_H = 384 * SHEET_SCALE;

export function SpriteIcon({ index, label }: { index: number; label: string }) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-block shrink-0"
      style={{
        width: CELL_W,
        height: CELL_H,
        backgroundImage: "url(/assets/icon-sheet.png)",
        backgroundSize: `${SHEET_W}px ${SHEET_H}px`,
        backgroundPosition: `${-col * CELL_W}px ${-row * CELL_H}px`,
      }}
    />
  );
}

/* ---- S2: Three screens. One room. ---- */

const FACTS = ["4-12 teams", "Snake + auction", "One price per draft", "Results kept 2 years"];

export function ScreensSection() {
  return (
    <section id="room" data-reveal className="relative overflow-hidden">
      <img src="/assets/plate-ambient.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <p className="font-chyron text-[11px] uppercase tracking-widest text-scarlet">The room</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tighter text-chalk md:text-6xl">
          Three screens. One room.
        </h2>
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-mist">
          Every device renders the same authoritative state. When a pick lands, it lands everywhere at once.
        </p>

        <div className="mt-14 grid items-start gap-6 md:grid-cols-[1fr_1.6fr]">
          <div className="relative mx-auto w-52 md:w-full md:max-w-[240px]">
            <img
              src="/assets/ui-phone.png"
              alt="Manager phone app showing the on-the-clock timer and a ranked player list"
              className="w-full rounded-lg border border-chalk/15 shadow-2xl shadow-black/50"
            />
            <p className="mt-3 text-center font-chyron text-[11px] uppercase tracking-wider text-mist">Managers · join by code</p>
          </div>
          <div className="space-y-6">
            <figure>
              <img
                src="/assets/ui-console.png"
                alt="Commissioner console with draft status, timer controls and an activity log"
                className="w-full rounded-lg border border-chalk/15 shadow-2xl shadow-black/50"
              />
              <figcaption className="mt-3 font-chyron text-[11px] uppercase tracking-wider text-mist">Commissioner · full control, no silent edits</figcaption>
            </figure>
            <figure className="md:ml-14">
              <img
                src="/assets/ui-tv-board.png"
                alt="Television draft board with team columns, round rows and a pick ticker"
                className="w-full rounded-lg border border-chalk/15 shadow-2xl shadow-black/50"
              />
              <figcaption className="mt-3 font-chyron text-[11px] uppercase tracking-wider text-mist">The TV · read-only display code</figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* product facts strip */}
      <div className="relative border-y border-chalk/10 bg-pitch/60 backdrop-blur-sm">
        <ul className="mx-auto flex max-w-7xl flex-wrap items-center px-4 py-5 font-chyron md:px-6">
          {FACTS.map((f, i) => (
            <li key={f} className="flex items-center">
              {i > 0 && <span className="mx-4 text-scarlet md:mx-6" aria-hidden>/</span>}
              <span className="text-sm font-semibold uppercase tracking-wide text-chalk md:text-lg">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- S3: Two formats. One engine. ---- */

function SnakeBoardGraphic() {
  const cells: { x: number; y: number; n: number }[] = [];
  const cols = 5;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < cols; c++) {
      const col = r % 2 === 0 ? c : cols - 1 - c;
      cells.push({ x: col * 58, y: r * 46, n: r * cols + c + 1 });
    }
  }
  // serpentine path through row centers
  const d = [
    "M 29 23 H 261",
    "C 285 23 285 69 261 69",
    "H 29 C 5 69 5 115 29 115",
    "H 261 C 285 115 285 161 261 161 H 29",
  ].join(" ");
  return (
    <svg viewBox="-10 -10 320 204" className="w-full max-w-md" role="img" aria-label="Snake draft order weaving back and forth across a board">
      {cells.map((cell) => (
        <g key={cell.n}>
          <rect x={cell.x + 4} y={cell.y} width={50} height={34} rx={3} fill="none" stroke="#EEF2F8" strokeOpacity={0.35} />
          <text x={cell.x + 29} y={cell.y + 21} textAnchor="middle" fill="#EEF2F8" fillOpacity={0.7} fontSize="11" fontFamily="IBM Plex Mono, monospace">
            {cell.n}
          </text>
        </g>
      ))}
      <path data-snake-path d={d} fill="none" stroke="#D2394C" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function FormatsSection() {
  return (
    <section id="formats" data-reveal className="bg-pitch">
      <div className="mx-auto max-w-3xl px-4 pt-24 text-center md:pt-32">
        <h2 className="font-display text-4xl font-bold tracking-tighter text-chalk md:text-6xl">Two formats. One engine.</h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl md:grid-cols-2">
        {/* SNAKE panel */}
        <div className="border-y border-chalk/10 bg-pitch-2 px-6 py-14 md:border-r md:px-12">
          <p className="font-display text-5xl font-bold uppercase tracking-tighter text-chalk md:text-7xl">Snake</p>
          <div className="mt-8">
            <SnakeBoardGraphic />
          </div>
          <p className="mt-8 max-w-[48ch] text-base leading-relaxed text-mist">
            Order reverses every round. Keepers burn their round before pick one, and a timeout falls to your private queue, never to chance.
          </p>
        </div>
        {/* AUCTION panel */}
        <div className="border-y border-chalk/10 bg-pitch px-6 py-14 md:px-12">
          <p className="font-display text-5xl font-bold uppercase tracking-tighter text-chalk md:text-7xl">Auction</p>
          <div className="relative mt-8 max-w-md">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-[4px] border border-chalk/20" aria-hidden />
            <img
              src="/assets/auction-paddle.png"
              alt="A raised auction paddle under a spotlight"
              className="relative aspect-[4/3] w-full rounded-[4px] border border-chalk/15 object-cover object-top"
            />
            <p className="absolute -bottom-5 right-4 border border-chalk/30 bg-pitch px-4 py-2 font-chyron text-2xl font-semibold text-chalk">
              $47<span className="ml-2 inline-block h-3 w-1.5 bg-scarlet align-middle" aria-hidden />
            </p>
          </div>
          <p className="mt-12 max-w-[48ch] text-base leading-relaxed text-mist">
            Every manager holds $200 and a dollar stays reserved for each open slot. The last legal bid before zero wins the player.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---- S4: The rules engine ---- */

const RULES: { label: string; body: string; icon: number; iconLabel: string }[] = [
  {
    label: "Anti-snipe clock",
    body: "A bid inside the final seven seconds resets the clock to seven, the next to five, then three for every snipe after. Bids outside the window change the leader, not the deadline.",
    icon: 0,
    iconLabel: "Stopwatch",
  },
  {
    label: "Server deadlines",
    body: "The room decides what arrived in time, not your phone. Drop, reconnect, and the clock is exactly where it should be.",
    icon: 5,
    iconLabel: "Lock shield",
  },
  {
    label: "Private queues",
    body: "Rank the players you want and label the ones you never want auto-drafted. Timeouts pull from the top of your list.",
    icon: 3,
    iconLabel: "Queue list",
  },
  {
    label: "Keepers",
    body: "Assign keeper players before the room opens. Each one consumes its configured snake round or auction salary.",
    icon: 6,
    iconLabel: "Ticket",
  },
  {
    label: "Auto-draft",
    body: "Absent managers still field a legal roster: queue first, best positional fit second, best available player last.",
    icon: 2,
    iconLabel: "Snaking path",
  },
  {
    label: "Draft grades",
    body: "Every roster gets a public letter grade at the lock, scored against rankings and value. No edits, no undo, ever.",
    icon: 7,
    iconLabel: "Grade card",
  },
];

export function EngineSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="engine" className="relative overflow-hidden bg-pitch">
      <p
        data-clock-numeral
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-chyron text-[38vw] font-semibold leading-none text-scarlet md:-right-24 md:text-[30rem]"
      >
        :07
      </p>
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <h2 className="font-display text-4xl font-bold tracking-tighter text-chalk md:text-6xl">The rules engine</h2>
        <ul className="mt-12 max-w-2xl border-t border-chalk/15">
          {RULES.map((r, i) => (
            <li key={r.label} className="border-b border-chalk/15">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-chalk"
              >
                <span className={`font-chyron text-sm uppercase tracking-widest md:text-base ${open === i ? "text-chalk" : "text-mist"}`}>
                  {r.label}
                </span>
                <span className="ml-auto font-chyron text-lg text-mist" aria-hidden>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 fdr-motion"
                style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="flex items-start gap-4 pb-5">
                    <SpriteIcon index={r.icon} label={r.iconLabel} />
                    <p className="max-w-[52ch] text-base leading-relaxed text-mist">{r.body}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- S5: TV night ---- */

export function TvSection() {
  return (
    <section id="tv" className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      <img
        data-tv-plate
        src="/assets/tv-night.png"
        alt="A dark living room lit by a television showing a glowing draft board"
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-pitch/55" aria-hidden />
      <div className="relative z-10 max-w-2xl px-4 py-28 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tighter text-chalk md:text-6xl">The TV is the stage.</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-chalk/85">
          One display code puts a synchronized board, pick ticker and player cards on every screen in the room.
        </p>
        {/* CTA garment: ghost slab with a scanline sweep on hover */}
        <Link
          to="/tv"
          className="group relative mt-8 inline-block overflow-hidden border border-chalk/70 px-7 py-3.5 font-chyron text-sm font-semibold uppercase tracking-wide text-chalk backdrop-blur-sm transition-colors hover:border-chalk active:translate-y-[1px]"
        >
          <span
            className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-chalk/20 transition-[left] duration-500 group-hover:left-[130%] fdr-motion"
            aria-hidden
          />
          Open the TV board
        </Link>
      </div>
    </section>
  );
}

/* ---- S6: demo frame CTA ---- */

const MINI_BOARD = [3, 9, 14, 21, 26, 33, 38, 45];

export function DemoCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <img src="/assets/plate-streaks.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-pitch/70" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-36">
        {/* CTA garment: the whole broadcast frame is the hit target; corner
            brackets close around it on hover like a viewfinder */}
        <Link to="/demo" className="group relative mx-auto block max-w-3xl border border-chalk/40 px-6 py-14 text-center shadow-[0_0_80px_rgba(210,57,76,0.25)] transition-shadow hover:shadow-[0_0_120px_rgba(210,57,76,0.45)] md:px-14 md:py-20">
          <span className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-scarlet transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 fdr-motion" aria-hidden />
          <span className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-scarlet transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1 fdr-motion" aria-hidden />
          <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-scarlet transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 fdr-motion" aria-hidden />
          <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-scarlet transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 fdr-motion" aria-hidden />

          <span className="absolute left-4 top-3 font-chyron text-[10px] uppercase tracking-widest text-mist">Live</span>
          <span className="absolute bottom-3 right-4 font-chyron text-[10px] uppercase tracking-widest text-mist">No sign-up</span>

          {/* mini board motif */}
          <span className="mx-auto mb-8 grid w-fit grid-cols-8 gap-1" aria-hidden>
            {Array.from({ length: 48 }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 w-6 rounded-[2px] md:h-3 md:w-8 ${MINI_BOARD.includes(i) ? "bg-scarlet/80" : "border border-chalk/20"}`}
              />
            ))}
          </span>
          <span className="block font-display text-3xl font-bold tracking-tighter text-chalk md:text-5xl">Run a mock draft right now</span>
          <span className="mt-3 block font-chyron text-xs text-mist md:text-sm">Ten teams, one of them yours. The clock is real.</span>
        </Link>
      </div>
    </section>
  );
}

/* ---- S7: pricing + waitlist ---- */

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Create the room",
    body: "Pick snake or auction, set roster slots, timers and keepers. Pay once for the room, not per season.",
  },
  {
    n: "02",
    title: "Invite by code",
    body: "Managers join from any phone with a four-character code. No accounts, no app store, no friction.",
  },
  {
    n: "03",
    title: "Go on air",
    body: "Reveal the order, start the clock and run the whole night from the commissioner console.",
  },
];

export function PricingSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "already" | "error">("idle");
  const [email, setEmail] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await joinWaitlist({ data: { email } });
      setStatus(res.ok ? (res.already ? "already" : "done") : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="pricing" data-reveal className="bg-pitch-2">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 md:grid-cols-[1.5fr_1fr] md:px-6 md:py-32">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-chalk md:text-6xl">One price, then draft.</h2>
          <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-mist">
            No subscription and no per-manager fees. The commissioner buys the room, the league shows up, the results stay locked and retrievable for two years.
          </p>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border-l border-chalk/15 pl-4">
                <p className="font-display text-4xl font-bold text-chalk">{s.n}</p>
                <p className="mt-2 font-chyron text-xs uppercase tracking-widest text-chalk">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:pt-2">
          <form onSubmit={submit} noValidate={false}>
            <label htmlFor="waitlist-email" className="block font-chyron text-xs font-semibold uppercase tracking-widest text-chalk">
              Get early access
            </label>
            <p className="mt-1 text-sm text-mist">Launching for the 2026 season. One email when doors open.</p>
            <input
              id="waitlist-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@league.com"
              className="mt-4 w-full rounded-[3px] border border-chalk/25 bg-pitch px-3 py-3 font-chyron text-sm text-chalk placeholder:text-mist/50 focus:border-scarlet focus:outline-none"
            />
            {/* CTA garment: ticket stub with perforation notches */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="relative mt-3 w-full bg-chalk px-4 py-3.5 font-chyron text-sm font-bold uppercase tracking-widest text-scarlet transition-colors [mask:radial-gradient(circle_10px_at_0_50%,transparent_98%,black),radial-gradient(circle_10px_at_100%_50%,transparent_98%,black)] [mask-composite:intersect] enabled:hover:bg-white enabled:active:translate-y-[1px] disabled:opacity-60"
            >
              {status === "sending" ? "Punching your ticket…" : "Join the waitlist"}
            </button>
            <p className="mt-3 min-h-5 font-chyron text-xs" role="status">
              {status === "done" && <span className="text-chalk">You are on the list. See you on draft night.</span>}
              {status === "already" && <span className="text-mist">That email is already on the list.</span>}
              {status === "error" && <span className="text-scarlet">That did not go through. Check the email and try again.</span>}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
