import type { ReactNode } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BiMessageSquareDots, BiMessageSquareX } from "react-icons/bi";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { generation as copy } from "@/components/form/content";
import { focusTriad, quietButton } from "@/components/form/styles";

/** One id for every stage of a generation's toast, so each stage replaces the last in place. */
export const GENERATION_TOAST = "trip-generation";

const smallPill = `inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] motion-reduce:transition-none ${focusTriad}`;
const inkPill = `${smallPill} bg-sorbet-ink text-sorbet-offwhite`;
const limePill = `${smallPill} bg-sorbet-lime text-sorbet-ink`;

const dismiss = () => toast.dismiss(GENERATION_TOAST);

/**
 * The card each stage shows. react-hot-toast portals to the document root, outside any
 * page's `font-sorbet`, and gives a custom toast no live region, so the card brings both.
 */
function ToastCard({
  icon,
  message,
  role = "status",
  children,
}: {
  icon: ReactNode;
  message: string;
  role?: "status" | "alert";
  children: ReactNode;
}) {
  return (
    <div
      role={role}
      className="flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 rounded-2xl bg-sorbet-white px-5 py-4 font-sorbet text-sorbet-ink antialiased shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]"
    >
      <p className="flex items-center gap-2.5 text-base font-semibold">
        {icon}
        {message}
      </p>
      <div className="flex items-center justify-end gap-2">{children}</div>
    </div>
  );
}

export function PlanningToast({ onStop }: { onStop: () => void }) {
  return (
    <ToastCard
      icon={<SquiggleLoader className="h-6 w-9 shrink-0 text-sorbet-ink" />}
      message={copy.planning}
    >
      <button type="button" onClick={onStop} className={limePill}>
        {copy.stop}
      </button>
    </ToastCard>
  );
}

export function ReadyToast({ tripUrl }: { tripUrl: string }) {
  return (
    <ToastCard icon={<BiMessageSquareDots aria-hidden size={22} className="shrink-0" />} message={copy.ready}>
      <button type="button" onClick={dismiss} className={quietButton}>
        {copy.dismiss}
      </button>
      <Link href={`/trips/${tripUrl}`} onClick={dismiss} className={inkPill}>
        {copy.view}
      </Link>
    </ToastCard>
  );
}

export function FailedToast() {
  return (
    <ToastCard
      role="alert"
      icon={
        <span aria-hidden className="shrink-0 text-sorbet-alert">
          <BiMessageSquareX size={22} />
        </span>
      }
      message={copy.failed}
    >
      <button type="button" onClick={dismiss} className={quietButton}>
        {copy.dismiss}
      </button>
      <Link href="/form" onClick={dismiss} className={inkPill}>
        {copy.backToForm}
      </Link>
    </ToastCard>
  );
}
