import { useEffect } from "react";

export function useConfirmOnPageExit(isSaved: boolean | null) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isSaved]);
}
