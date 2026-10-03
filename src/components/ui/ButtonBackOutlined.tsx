"use client";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

/**
 * The system's circular arrow, pointing backwards: a filled ink disc.
 *
 * `position` carries the call site's absolute placement. It had no accessible
 * name before this — the glyph is the whole button, so a screen reader read it
 * as an empty control.
 */
function ButtonBackOutlined({ position }: { position: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => router.back()}
      className={`z-40 grid size-10 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink ${position}`}
    >
      <IoArrowBack size={16} aria-hidden />
    </button>
  );
}

export default ButtonBackOutlined;
