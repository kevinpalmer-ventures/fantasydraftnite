// Server-authoritative-style draft rules engine, simulated locally for the demo.
// Mirrors the product spec: snake order, auction $1 reserve and max-bid rule,
// anti-snipe resets of 7 then 5 then 3 seconds, queue-first auto-draft.

import {
  AUCTION_BUDGET,
  PLAYERS,
  ROSTER_SIZE,
  ROSTER_SLOTS,
  TEAM_COUNT,
  TEAM_NAMES,
  USER_TEAM_INDEX,
  type Player,
  type Position,
} from "./data";

export type Mode = "snake" | "auction";

export interface RosterEntry {
  playerId: number;
  price?: number;
  overall?: number;
  round?: number;
}

export interface Team {
  id: number;
  name: string;
  owner: string;
  isUser: boolean;
  roster: RosterEntry[];
  budget: number;
  finished: boolean;
  // private AI temperament: how far above sticker value this team will go
  aggression: number;
}

export interface LogEntry {
  id: number;
  at: number;
  kind: "pick" | "sale" | "nomination" | "bid" | "system";
  text: string;
}

export interface AuctionLot {
  playerId: number;
  nominatorId: number;
  highBid: number;
  leaderId: number;
  snipeStage: 0 | 1 | 2 | 3;
}

export interface DraftState {
  mode: Mode;
  spectate: boolean;
  status: "live" | "paused" | "complete";
  teams: Team[];
  available: number[];
  queue: number[];
  overall: number; // 0-based overall pick index (snake)
  nomPointer: number; // rotating nomination pointer (auction)
  lot: AuctionLot | null;
  deadline: number; // epoch ms, authoritative
  timerTotal: number; // ms, for progress rendering
  aiActAt: number; // next scheduled AI decision
  log: LogEntry[];
  lastEvent: { kind: "pick" | "sale"; playerId: number; teamId: number; price?: number; seq: number } | null;
  seq: number;
}

export const byId = new Map(PLAYERS.map((p) => [p.id, p]));

export function player(id: number): Player {
  const p = byId.get(id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

const SNAKE_CLOCK = 20_000;
const NOM_CLOCK = 12_000;
const BID_CLOCK = 10_000;

export function snakeTeamForPick(overall: number): number {
  const round = Math.floor(overall / TEAM_COUNT);
  const idx = overall % TEAM_COUNT;
  return round % 2 === 0 ? idx : TEAM_COUNT - 1 - idx;
}

export function openSlots(team: Team): number {
  return ROSTER_SIZE - team.roster.length;
}

export function maxBid(team: Team): number {
  // reserve $1 for every roster spot that would remain after this purchase
  return team.budget - Math.max(0, openSlots(team) - 1);
}

export function neededPositions(team: Team): Set<Position> {
  const filled = new Map<number, boolean>();
  const roster = team.roster.map((r) => player(r.playerId));
  const used = new Set<number>();
  for (const p of roster) {
    for (let i = 0; i < ROSTER_SLOTS.length; i++) {
      if (used.has(i)) continue;
      if (ROSTER_SLOTS[i].accepts.includes(p.pos)) {
        used.add(i);
        filled.set(i, true);
        break;
      }
    }
  }
  const need = new Set<Position>();
  for (let i = 0; i < ROSTER_SLOTS.length; i++) {
    if (!used.has(i)) for (const pos of ROSTER_SLOTS[i].accepts) need.add(pos);
  }
  return need;
}

function makeTeams(spectate: boolean): Team[] {
  return TEAM_NAMES.map((t, i) => ({
    id: i,
    name: t.name,
    owner: t.owner,
    isUser: !spectate && i === USER_TEAM_INDEX,
    roster: [],
    budget: AUCTION_BUDGET,
    finished: false,
    aggression: 0.85 + ((i * 37) % 40) / 100,
  }));
}

export function initDraft(mode: Mode, spectate: boolean, now: number): DraftState {
  const teams = makeTeams(spectate);
  const base: DraftState = {
    mode,
    spectate,
    status: "live",
    teams,
    available: PLAYERS.map((p) => p.id),
    queue: [],
    overall: 0,
    nomPointer: 0,
    lot: null,
    deadline: now + (mode === "snake" ? SNAKE_CLOCK : NOM_CLOCK),
    timerTotal: mode === "snake" ? SNAKE_CLOCK : NOM_CLOCK,
    aiActAt: now + aiDelay(),
    log: [
      {
        id: 1,
        at: now,
        kind: "system",
        text: mode === "snake" ? "Snake draft is live. Round 1 is on the clock." : "Auction is live. First nomination is up.",
      },
    ],
    lastEvent: null,
    seq: 1,
  };
  return base;
}

function aiDelay(): number {
  return 1400 + Math.random() * 2200;
}

function pushLog(s: DraftState, kind: LogEntry["kind"], text: string, now: number) {
  s.seq += 1;
  s.log = [...s.log.slice(-59), { id: s.seq, at: now, kind, text }];
}

function bestForTeam(s: DraftState, team: Team, preferQueue: boolean): number | null {
  if (preferQueue && team.isUser) {
    for (const qid of s.queue) if (s.available.includes(qid)) return qid;
  }
  const need = neededPositions(team);
  const fits = s.available.filter((id) => need.has(player(id).pos));
  if (fits.length > 0) return fits[0];
  return s.available[0] ?? null;
}

function applyPick(s: DraftState, teamId: number, playerId: number, now: number, auto: boolean) {
  const team = s.teams[teamId];
  const round = Math.floor(s.overall / TEAM_COUNT) + 1;
  team.roster = [...team.roster, { playerId, overall: s.overall + 1, round }];
  s.teams = s.teams.map((t) => (t.id === teamId ? team : t));
  s.available = s.available.filter((id) => id !== playerId);
  s.queue = s.queue.filter((id) => id !== playerId);
  const p = player(playerId);
  s.seq += 1;
  s.lastEvent = { kind: "pick", playerId, teamId, seq: s.seq };
  pushLog(s, "pick", `${round}.${(s.overall % TEAM_COUNT) + 1} ${team.name} ${auto ? "auto-selected" : "selected"} ${p.name} (${p.pos})`, now);
  s.overall += 1;
  if (s.overall >= TEAM_COUNT * ROSTER_SIZE || s.available.length === 0) {
    s.status = "complete";
    pushLog(s, "system", "Draft complete. Boards are locked.", now);
    return;
  }
  s.deadline = now + SNAKE_CLOCK;
  s.timerTotal = SNAKE_CLOCK;
  s.aiActAt = now + aiDelay();
}

function eligibleNominator(s: DraftState, from: number): number {
  for (let k = 0; k < TEAM_COUNT; k++) {
    const idx = (from + k) % TEAM_COUNT;
    const t = s.teams[idx];
    if (!t.finished && openSlots(t) > 0 && maxBid(t) >= 1) return idx;
  }
  return -1;
}

function autoFinishTeams(s: DraftState, now: number) {
  for (const t of s.teams) {
    if (!t.finished && (openSlots(t) === 0 || maxBid(t) < 1)) {
      t.finished = true;
      if (openSlots(t) > 0) pushLog(s, "system", `${t.name} can no longer bid and is marked finished.`, now);
    }
  }
  s.teams = [...s.teams];
}

function startNomination(s: DraftState, now: number) {
  autoFinishTeams(s, now);
  const nominator = eligibleNominator(s, s.nomPointer);
  const anyBuyer = s.teams.some((t) => !t.finished && openSlots(t) > 0 && maxBid(t) >= 1);
  if (nominator === -1 || !anyBuyer || s.available.length === 0) {
    s.status = "complete";
    s.lot = null;
    pushLog(s, "system", "No legal purchases remain. Auction complete.", now);
    return;
  }
  s.nomPointer = nominator;
  s.lot = null;
  s.deadline = now + NOM_CLOCK;
  s.timerTotal = NOM_CLOCK;
  s.aiActAt = now + aiDelay();
}

function applyNomination(s: DraftState, nominatorId: number, playerId: number, openingBid: number, now: number) {
  const team = s.teams[nominatorId];
  const bid = Math.max(1, Math.min(openingBid, maxBid(team)));
  s.available = s.available.filter((id) => id !== playerId);
  s.queue = s.queue.filter((id) => id !== playerId);
  s.lot = { playerId, nominatorId, highBid: bid, leaderId: nominatorId, snipeStage: 0 };
  const p = player(playerId);
  pushLog(s, "nomination", `${team.name} nominates ${p.name} (${p.pos}) at $${bid}`, now);
  s.deadline = now + BID_CLOCK;
  s.timerTotal = BID_CLOCK;
  s.aiActAt = now + 500 + Math.random() * 1200;
}

function applyBid(s: DraftState, teamId: number, amount: number, now: number): boolean {
  const lot = s.lot;
  if (!lot) return false;
  const team = s.teams[teamId];
  if (team.finished || teamId === lot.leaderId) return false;
  if (now >= s.deadline) return false;
  if (amount <= lot.highBid || amount > maxBid(team)) return false;
  lot.highBid = amount;
  lot.leaderId = teamId;
  // anti-snipe: 7s, then 5s, then 3s for every later snipe
  const remaining = s.deadline - now;
  const windows = [7000, 5000, 3000] as const;
  const stage = Math.min(lot.snipeStage, 2);
  if (remaining <= windows[stage]) {
    const reset = windows[Math.min(lot.snipeStage, 2)];
    s.deadline = now + reset;
    s.timerTotal = reset;
    lot.snipeStage = Math.min(3, lot.snipeStage + 1) as AuctionLot["snipeStage"];
    pushLog(s, "bid", `${team.name} bids $${amount}. Clock resets to :0${reset / 1000}.`, now);
  } else {
    pushLog(s, "bid", `${team.name} bids $${amount} on ${player(lot.playerId).name}`, now);
  }
  s.lot = { ...lot };
  s.seq += 1;
  s.aiActAt = now + 400 + Math.random() * 1400;
  return true;
}

function settleLot(s: DraftState, now: number) {
  const lot = s.lot;
  if (!lot) return;
  const team = s.teams[lot.leaderId];
  team.budget -= lot.highBid;
  team.roster = [...team.roster, { playerId: lot.playerId, price: lot.highBid }];
  s.teams = s.teams.map((t) => (t.id === team.id ? team : t));
  const p = player(lot.playerId);
  s.seq += 1;
  s.lastEvent = { kind: "sale", playerId: lot.playerId, teamId: team.id, price: lot.highBid, seq: s.seq };
  pushLog(s, "sale", `SOLD: ${p.name} to ${team.name} for $${lot.highBid}`, now);
  s.lot = null;
  s.nomPointer = (s.nomPointer + 1) % TEAM_COUNT;
  startNomination(s, now);
}

// ---- AI decision-making ----

function aiValuation(team: Team, p: Player): number {
  const need = neededPositions(team);
  const needBoost = need.has(p.pos) ? 1 : 0.35;
  return Math.max(1, Math.round(p.value * team.aggression * needBoost));
}

function aiNominationChoice(s: DraftState, team: Team): number {
  // AIs nominate either a top player (price discovery) or a positional need
  const pool = s.available.slice(0, 14);
  const need = neededPositions(team);
  const fit = pool.find((id) => need.has(player(id).pos));
  const choice = Math.random() < 0.6 && fit !== undefined ? fit : pool[Math.floor(Math.random() * Math.min(6, pool.length))];
  return choice ?? s.available[0];
}

function runAi(s: DraftState, now: number) {
  if (s.mode === "snake") {
    const teamId = snakeTeamForPick(s.overall);
    const team = s.teams[teamId];
    if (team.isUser) return;
    const pick = bestForTeam(s, team, false);
    if (pick !== null) applyPick(s, teamId, pick, now, false);
    return;
  }
  // auction
  if (!s.lot) {
    const nominator = s.teams[s.nomPointer];
    if (nominator.isUser) return;
    const playerId = aiNominationChoice(s, nominator);
    const val = aiValuation(nominator, player(playerId));
    const opening = Math.max(1, Math.min(Math.floor(val * 0.35), maxBid(nominator)));
    applyNomination(s, s.nomPointer, playerId, opening, now);
    return;
  }
  // bidding: pick one eligible AI that still values the player above current bid
  const lot = s.lot;
  const p = player(lot.playerId);
  const contenders = s.teams.filter(
    (t) => !t.isUser && !t.finished && t.id !== lot.leaderId && maxBid(t) > lot.highBid && aiValuation(t, p) > lot.highBid,
  );
  if (contenders.length === 0) {
    s.aiActAt = s.deadline + 1000; // nobody else wants it; let it ride
    return;
  }
  const bidder = contenders[Math.floor(Math.random() * contenders.length)];
  const val = aiValuation(bidder, p);
  const room = val - lot.highBid;
  const jump = room > 12 && Math.random() < 0.3 ? 5 : 1;
  const amount = Math.min(lot.highBid + jump, maxBid(bidder));
  // late-clock hesitation makes snipes happen naturally
  applyBid(s, bidder.id, amount, now);
}

// ---- public actions ----

export type DraftAction =
  | { type: "tick"; now: number }
  | { type: "userPick"; playerId: number; now: number }
  | { type: "userNominate"; playerId: number; openingBid: number; now: number }
  | { type: "userBid"; amount: number; now: number }
  | { type: "togglePause"; now: number }
  | { type: "queueAdd"; playerId: number }
  | { type: "queueRemove"; playerId: number }
  | { type: "queueMove"; playerId: number; dir: -1 | 1 };

export function currentActorId(s: DraftState): number {
  if (s.mode === "snake") return snakeTeamForPick(s.overall);
  return s.lot ? s.lot.leaderId : s.nomPointer;
}

export function userTeam(s: DraftState): Team | undefined {
  return s.teams.find((t) => t.isUser);
}

export function reduce(prev: DraftState, action: DraftAction): DraftState {
  const s: DraftState = { ...prev, teams: prev.teams.map((t) => ({ ...t, roster: [...t.roster] })), log: [...prev.log], queue: [...prev.queue], available: [...prev.available], lot: prev.lot ? { ...prev.lot } : null };

  switch (action.type) {
    case "queueAdd":
      if (!s.queue.includes(action.playerId) && s.available.includes(action.playerId)) s.queue.push(action.playerId);
      return s;
    case "queueRemove":
      s.queue = s.queue.filter((id) => id !== action.playerId);
      return s;
    case "queueMove": {
      const i = s.queue.indexOf(action.playerId);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= s.queue.length) return s;
      [s.queue[i], s.queue[j]] = [s.queue[j], s.queue[i]];
      return s;
    }
    case "togglePause": {
      if (s.status === "complete") return s;
      if (s.status === "live") {
        s.status = "paused";
        s.timerTotal = Math.max(0, s.deadline - action.now); // stash remaining
        pushLog(s, "system", "Commissioner paused the room.", action.now);
      } else {
        s.status = "live";
        s.deadline = action.now + s.timerTotal;
        s.aiActAt = action.now + aiDelay();
        pushLog(s, "system", "Room resumed.", action.now);
      }
      return s;
    }
  }

  if (s.status !== "live") return s;

  switch (action.type) {
    case "userPick": {
      if (s.mode !== "snake") return s;
      const teamId = snakeTeamForPick(s.overall);
      if (!s.teams[teamId].isUser || !s.available.includes(action.playerId)) return s;
      applyPick(s, teamId, action.playerId, action.now, false);
      return s;
    }
    case "userNominate": {
      if (s.mode !== "auction" || s.lot) return s;
      const team = s.teams[s.nomPointer];
      if (!team.isUser || !s.available.includes(action.playerId)) return s;
      applyNomination(s, s.nomPointer, action.playerId, action.openingBid, action.now);
      return s;
    }
    case "userBid": {
      if (s.mode !== "auction" || !s.lot) return s;
      const team = userTeam(s);
      if (!team) return s;
      applyBid(s, team.id, action.amount, action.now);
      return s;
    }
    case "tick": {
      const now = action.now;
      // deadline enforcement first (server-authoritative cutoff)
      if (now >= s.deadline) {
        if (s.mode === "snake") {
          const teamId = snakeTeamForPick(s.overall);
          const pick = bestForTeam(s, s.teams[teamId], true);
          if (pick !== null) applyPick(s, teamId, pick, now, true);
          return s;
        }
        if (s.lot) {
          settleLot(s, now);
          return s;
        }
        // nomination timeout: auto-nominate best available
        const nominator = s.teams[s.nomPointer];
        const pid = nominator.isUser ? (s.queue.find((q) => s.available.includes(q)) ?? s.available[0]) : aiNominationChoice(s, nominator);
        if (pid !== undefined) applyNomination(s, s.nomPointer, pid, 1, now);
        return s;
      }
      if (now >= s.aiActAt) {
        runAi(s, now);
        if (now >= s.aiActAt) s.aiActAt = now + aiDelay();
      }
      return s;
    }
  }
  return s;
}

// ---- grading ----

export interface TeamGrade {
  teamId: number;
  grade: string;
  note: string;
  score: number;
}

export function gradeTeams(s: DraftState): TeamGrade[] {
  const scores = s.teams.map((t) => {
    let score = 0;
    if (s.mode === "snake") {
      for (const r of t.roster) {
        const p = player(r.playerId);
        score += (r.overall ?? 0) - p.adp; // positive = value fell to you
      }
    } else {
      for (const r of t.roster) {
        const p = player(r.playerId);
        score += p.value - (r.price ?? 0);
      }
      score -= t.budget * 0.5; // unspent budget drags the grade
    }
    return { teamId: t.id, score };
  });
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const letters = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"];
  return scores.map((sc) => {
    const rank = sorted.findIndex((x) => x.teamId === sc.teamId);
    const grade = letters[Math.min(rank, letters.length - 1)];
    const note =
      rank === 0 ? "Best value board of the night." : rank < 3 ? "Strong value at the right turns." : rank < 7 ? "Solid board, a few reaches." : "Paid retail all night.";
    return { teamId: sc.teamId, grade, note, score: Math.round(sc.score) };
  });
}
