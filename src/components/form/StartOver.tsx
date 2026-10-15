"use client";
import { useState } from "react";
import { AlertDialog } from "@heroui/react";
import { startOver as copy } from "./content";
import { inkPill, limePill, quietButton } from "./styles";

/**
 * "Start over", behind a confirm: the draft survives leaving /form, so this is the way
 * to a fresh form. Opened by a plain button, not `AlertDialog.Trigger`, which renders
 * its own `role="button"` around whatever it holds (design-notes, gotcha 12).
 */
function StartOver({ onConfirm, className }: { onConfirm: () => void; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${quietButton} ${className ?? ""}`}
      >
        {copy.button}
      </button>
      {/* Escape and a click outside both cancel, since cancelling loses nothing. */}
      <AlertDialog.Backdrop
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isDismissable
        isKeyboardDismissDisabled={false}
        className="bg-sorbet-ink/40"
      >
        <AlertDialog.Container size="lg" placement="center">
          <AlertDialog.Dialog className="rounded-3xl bg-white p-6 font-sorbet text-sorbet-ink sm:p-8">
            {({ close }) => (
              <>
                <AlertDialog.Header>
                  <AlertDialog.Heading className="text-2xl font-semibold text-sorbet-ink">
                    {copy.heading}
                  </AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p className="text-base text-sorbet-ink/70">{copy.body}</p>
                </AlertDialog.Body>
                {/* Stacked full-width on a phone, where the two pills don't fit side by side. */}
                <AlertDialog.Footer className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" onClick={close} className={limePill}>
                    {copy.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onConfirm();
                      close();
                    }}
                    className={inkPill}
                  >
                    {copy.confirm}
                  </button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}

export default StartOver;
