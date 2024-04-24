import { useEffect, useLayoutEffect, useState } from "react";

export function useWindowSize() {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
  });

  useIsomorphicLayoutEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
