import type { ReactNode } from "react";
import { BiMessageSquareCheck, BiMessageSquareDots, BiMessageSquareX } from "react-icons/bi";

const tones = {
  info: { role: "status", icon: <BiMessageSquareDots aria-hidden size={22} className="shrink-0" /> },
  success: {
    role: "status",
    icon: (
      <span aria-hidden className="shrink-0 text-sorbet-success">
        <BiMessageSquareCheck size={22} />
      </span>
    ),
  },
  alert: {
    role: "alert",
    icon: (
      <span aria-hidden className="shrink-0 text-sorbet-alert">
        <BiMessageSquareX size={22} />
      </span>
    ),
  },
} as const;

/**
 * Every toast's card: a white card with the system's one shadow, a message and, below it,
 * optional actions, which widen it to a fixed width. react-hot-toast portals to the document
 * root, outside any page's `font-sorbet`, and gives a custom toast no live region, so the card
 * brings both. `icon` replaces the tone's glyph.
 */
function ToastCard({
  message,
  tone = "info",
  icon,
  children,
}: {
  message: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      role={tones[tone].role}
      className={`flex flex-col gap-3 rounded-2xl bg-sorbet-white px-5 py-4 font-sorbet text-sorbet-ink antialiased shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)] ${children ? "w-[min(24rem,calc(100vw-2rem))]" : "max-w-[calc(100vw-2rem)]"}`}
    >
      <p className="flex items-center gap-2.5 text-base font-semibold">
        {icon ?? tones[tone].icon}
        {message}
      </p>
      {children && <div className="flex items-center justify-end gap-2">{children}</div>}
    </div>
  );
}

export default ToastCard;
