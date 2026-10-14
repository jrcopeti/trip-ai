import Image from "next/image";
import type { Trip } from "@prisma/client";
import defaultImage3 from "@/assets/travel-photos/3.jpg";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { Section } from "./Section";

/**
 * A breather between the tours and the packing list: the trip's third photo,
 * centred in a 4:3 frame.
 *
 * Unsplash is searched without an orientation, so the photo is usually 3:2
 * landscape and sometimes portrait. A wide band (it was full width at 60vh, about
 * 2.1:1) cropped most of the frame away; 4:3 at a narrower measure loses only a
 * sliver of a landscape photo and keeps a portrait one recognisable.
 */
function PhotoSection({ trip }: { trip: Trip }) {
  const { placeholder } = trip;
  const image3 = trip.tripImages[2];

  return (
    <Section ground="bg-sorbet-canvas">
      <Reveal>
        <div className="relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-[2rem]">
          <Image
            src={image3 ?? defaultImage3}
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
