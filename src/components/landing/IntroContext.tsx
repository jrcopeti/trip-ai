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
 * `done` starts the same on server and client, so the tree hydrates cleanly;
 * only the timing of the flip is client-side. It starts false, or true when
 * `skip` says the intro was already seen and is not being rendered at all.
 */
type IntroState = { done: boolean; finish: () => void };

const IntroContext = createContext<IntroState>({ done: true, finish: () => {} });

export function IntroProvider({
  skip = false,
  children,
}: {
  skip?: boolean;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(skip);
  const finish = useCallback(() => setDone(true), []);
  const value = useMemo(() => ({ done, finish }), [done, finish]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

/** Outside an IntroProvider this reports done, so components animate normally. */
export function useIntro() {
  return useContext(IntroContext);
}
