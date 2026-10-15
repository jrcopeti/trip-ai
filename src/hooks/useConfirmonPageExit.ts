import { useEffect } from "react";

/**
 * Asks before the page is left, for as long as the caller is mounted: the generation
 * loader, since leaving drops the redirect to the trip the server is still writing.
 */
export function useConfirmOnPageExit() {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, []);
}
