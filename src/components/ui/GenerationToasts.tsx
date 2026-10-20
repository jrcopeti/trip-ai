"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { generation as copy } from "@/components/form/content";
import { focusTriad } from "@/components/form/styles";
import ToastCard from "./ToastCard";

/** The generation in flight: planning, then cancelled if stopped. Each replaces the last in place. */
export const GENERATION_TOAST = "trip-generation";

/**
 * The latest finished generation, ready or failed. Its own id, so the next generation's planning
 * toast can't dismiss it, and one id, so a newer result replaces it rather than stacking.
 */
export const RESULT_TOAST = "trip-generation-result";

const smallPill = `inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] motion-reduce:transition-none ${focusTriad}`;
const inkPill = `${smallPill} bg-sorbet-ink text-sorbet-offwhite`;
const limePill = `${smallPill} bg-sorbet-lime text-sorbet-ink`;

const dismissResult = () => toast.dismiss(RESULT_TOAST);

export function PlanningToast({ onStop }: { onStop: () => void }) {
  return (
    <ToastCard
      icon={<SquiggleLoader className="h-6 w-9 shrink-0 text-sorbet-ink" />}
      message={copy.planning}
    >
      <button type="button" onClick={onStop} className={limePill}>
        {copy.cancel}
      </button>
      {/* /form shows the loader while a generation is pending, and `GenerationToast` drops this toast there. */}
      <Link href="/form" className={inkPill}>
        {copy.view}
      </Link>
    </ToastCard>
  );
}

/**
 * The trip has landed. View opens it from anywhere but its own page; `opensItself` is the
 * redirect from /form, which hides View on /form too, since the traveller is already on the way.
 * Shown from elsewhere, it has no Dismiss: it stays until the trip's page is reached, then closes.
 */
export function ReadyToast({ tripUrl, opensItself = false }: { tripUrl: string; opensItself?: boolean }) {
  const pathname = usePathname();
  const tripPath = `/trips/${tripUrl}`;
  const isOnTrip = pathname === tripPath;
  const showView = !isOnTrip && !(opensItself && pathname === "/form");

  // The redirect's toast times out by itself; this one would otherwise stay on the trip for good.
  useEffect(() => {
    if (isOnTrip && !opensItself) dismissResult();
  }, [isOnTrip, opensItself]);

  return (
    <ToastCard tone="success" message={copy.ready}>
      {showView && (
        <Link href={tripPath} onClick={dismissResult} className={inkPill}>
          {copy.view}
        </Link>
      )}
    </ToastCard>
  );
}

/** Shown in place of `PlanningToast` when the traveller stops the generation. */
export function CancelledToast() {
  return <ToastCard tone="alert" message={copy.cancelled} />;
}

export function FailedToast() {
  return (
    <ToastCard tone="alert" message={copy.failed}>
      <button type="button" onClick={dismissResult} className={limePill}>
        {copy.dismiss}
      </button>
      <Link href="/form" onClick={dismissResult} className={inkPill}>
        {copy.backToForm}
      </Link>
    </ToastCard>
  );
}
