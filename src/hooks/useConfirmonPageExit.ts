import { useEffect } from "react";

export function useConfirmOnPageExit({ isSaved }: { isSaved: boolean }) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isSaved) {
        return;
      }
      const message =
        "Any unsaved changes will be lost. Are you sure you want to leave?";
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isSaved]);
}
