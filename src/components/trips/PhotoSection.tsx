import Image, { type StaticImageData } from "next/image";
import type { Trip } from "@/generated/prisma/client";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { Section } from "./Section";

/**
 * A breather between sections: one of the trip's photos, or `fallback` when the
 * search found too few, centred in a 4:3 frame on canvas.
 *
 * Unsplash is searched without an orientation, so the photo is usually 3:2
 * landscape and sometimes portrait. 4:3 at a narrower measure loses only a sliver
 * of a landscape photo and keeps a portrait one recognisable.
 */
function PhotoSection({
  image,
  fallback,
  placeholder,
}: Pick<Trip, "placeholder"> & { image?: string; fallback: StaticImageData }) {
  return (
    <Section ground="bg-sorbet-canvas">
      <Reveal>
        <div className="relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-[2rem]">
          <Image
            src={image ?? fallback}
            alt=""
            fill
            placeholder="blur"
            blurDataURL={placeholder ?? defaultPlaceholder}
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      </Reveal>
    </Section>
  );
}

export default PhotoSection;
