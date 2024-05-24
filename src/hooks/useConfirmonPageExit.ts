import { useEffect } from "react";
import { useTripResponse } from "./useTripResponse";

export function useConfirmOnPageExit() {
  const { isTripSaved } = useTripResponse();
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isTripSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isTripSaved]);
}
