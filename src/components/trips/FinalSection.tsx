"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Trip } from "@/generated/prisma/client";
import Closing, { buttonExtras, primaryPill, secondaryPill } from "./Closing";
import { closing as copy } from "./content";
import type { TripPhoto } from "./tripPhoto";

/** The saved route's last section: back to where you came from, or a new trip. */
function FinalSection({ photo, tip }: Pick<Trip, "tip"> & { photo: TripPhoto }) {
  const router = useRouter();

  return (
    <Closing
      image={photo.src}
      placeholder={photo.blurDataURL}
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
