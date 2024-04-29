import { useEffect } from "react";

export function useConfirmOnPageExit(isSaved: boolean | null) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isSaved) {
        return;
      }
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isSaved]);
}
