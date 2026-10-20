import { useEffect } from "react";

/**
 * Asks before the page is left while `isActive`: a generation in flight, since a reload or
 * a closed tab ends the page's JS and with it the way to the trip the server is writing.
 */
export function useConfirmOnPageExit(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isActive]);
}
