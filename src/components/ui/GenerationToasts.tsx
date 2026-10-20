import Link from "next/link";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { generation as copy } from "@/components/form/content";
import { smallInkPill as inkPill, smallLimePill as limePill } from "@/components/form/styles";
import { tripPath } from "@/lib/generation";
import ToastCard from "./ToastCard";

/** The generation in flight, off `/form`. */
export const PLANNING_TOAST = "trip-generation";

/** The last trip that landed off `/form`: one at most, a newer one replacing it. */
export const TRIP_TOAST = "trip-generation-trip";

/** The last failure, off `/form`. Its own id, so it never displaces the trip's toast. */
export const FAILURE_TOAST = "trip-generation-failure";

/** Timed news about the generation (cancelled, opened, failed on `/form`), each replacing the last. */
export const NOTICE_TOAST = "trip-generation-notice";

export function PlanningToast({ onCancel }: { onCancel: () => void }) {
  return (
    <ToastCard
      icon={<SquiggleLoader className="h-6 w-9 shrink-0 text-sorbet-ink" />}
      message={copy.planning}
    >
      <button type="button" onClick={onCancel} className={limePill}>
        {copy.cancel}
      </button>
      {/* /form shows the loader while a generation is pending. */}
      <Link href="/form" className={inkPill}>
        {copy.view}
      </Link>
    </ToastCard>
  );
}

/** The trip has landed. With `tripUrl`, View opens it; without, the traveller is on the way. */
export function ReadyToast({ tripUrl }: { tripUrl?: string }) {
  return (
    <ToastCard tone="success" message={copy.ready}>
      {tripUrl && (
        <Link href={tripPath(tripUrl)} className={inkPill}>
          {copy.view}
        </Link>
      )}
    </ToastCard>
  );
}

export function CancelledToast() {
  return <ToastCard tone="alert" message={copy.cancelled} />;
}

export function FailedToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <ToastCard tone="alert" message={copy.failed}>
      <button type="button" onClick={onDismiss} className={limePill}>
        {copy.dismiss}
      </button>
      {/* /form shows the failure panel, with "Try again" and the answers kept. */}
      <Link href="/form" className={inkPill}>
        {copy.backToForm}
      </Link>
    </ToastCard>
  );
}
