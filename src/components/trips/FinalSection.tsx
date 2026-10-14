"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Trip } from "@prisma/client";
import defaultImage5 from "@/assets/travel-photos/9.jpg";
import { defaultPlaceholder } from "@/lib/constants";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";

/** The saved route's last section: back to where you came from, or a new trip. */
function FinalSection({
  image,
  placeholder,
  tip,
}: Pick<Trip, "placeholder" | "tip"> & { image?: string }) {
  const router = useRouter();

  return (
    <Closing
      image={image ?? defaultImage5}
      placeholder={placeholder ?? defaultPlaceholder}
      tip={tip}
      heading={copy.final.heading}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className={`${primaryPill} ${buttonExtras}`}
      >
        {copy.final.back}
      </button>
      <Link href={copy.final.another.href} className={secondaryPill}>
        {copy.final.another.label}
      </Link>
    </Closing>
  );
}

export default FinalSection;
