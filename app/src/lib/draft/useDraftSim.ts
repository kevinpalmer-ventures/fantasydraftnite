// Client hook that runs the simulated room clock. All state changes flow
// through the reducer in engine.ts; the interval only dispatches ticks.
import { useEffect, useReducer, useRef } from "react";

import { initDraft, reduce, type DraftAction, type DraftState, type Mode } from "./engine";

export function useDraftSim(mode: Mode, spectate: boolean) {
  const [state, dispatch] = useReducer(
    (s: DraftState, a: DraftAction) => reduce(s, a),
    null,
    () => initDraft(mode, spectate, Date.now()),
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (stateRef.current.status === "live") dispatch({ type: "tick", now: Date.now() });
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  return { state, dispatch };
}

export function useNow(active: boolean): number {
  const [, force] = useReducer((n: number) => n + 1, 0);
  const nowRef = useRef(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      nowRef.current = Date.now();
      force();
    }, 100);
    return () => window.clearInterval(id);
  }, [active]);
  return nowRef.current;
}
