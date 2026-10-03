import Link from "next/link";
import { FaArrowRight, FaPlaneUp } from "react-icons/fa6";

import Reveal from "@/components/sorbet/Reveal";
import StickerBadge from "./StickerBadge";

function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-sorbet-lime px-5 py-28 sm:px-8 md:py-40">
      <StickerBadge
        label="go anywhere"
        icon={<FaPlaneUp />}
        tint="text-sorbet-orchid"
        size={112}
        spin={30}
        className="absolute right-[10%] top-32 hidden lg:block"
      />

      <Reveal className="mx-auto max-w-4xl text-center">
        <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-sorbet-ink">
          Where are you going next?
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-sorbet-ink/70 md:text-xl">
          Seven questions. One itinerary. No account needed.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/form"
            className="group inline-flex items-center gap-4 rounded-full bg-sorbet-ink py-3 pl-8 pr-3 text-lg font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink"
          >
            Start planning
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-full bg-sorbet-lime text-sorbet-ink transition-transform group-hover:translate-x-1"
            >
<FaArrowRight size={15} />
            </span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export default ClosingCta;
