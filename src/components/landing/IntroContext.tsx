"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Lets the hero know when the intro's curtain starts to lift.
 *
 * The hero is server-rendered underneath the intro so the page is crawlable from
 * the first byte — which means anything that animates on mount plays behind the
 * curtain and is finished before anyone sees it. Entrance animations in the hero
 * wait on `done` instead.
 *
 * `done` starts false on both server and client, so the tree hydrates cleanly;
 * only the timing of the flip is client-side.
 */
type IntroState = { done: boolean; finish: () => void };

const IntroContext = createContext<IntroState>({ done: true, finish: () => {} });

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);
  const value = useMemo(() => ({ done, finish }), [done, finish]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

/** Outside an IntroProvider this reports done, so components animate normally. */
export function useIntro() {
  return useContext(IntroContext);
}
