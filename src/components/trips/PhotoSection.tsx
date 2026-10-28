import Image from "next/image";
import Reveal from "@/components/sorbet/Reveal";
import { Section } from "./Section";
import type { TripPhoto } from "./tripPhoto";

/**
 * A breather between sections: one of the trip's photos, centred in a 4:3 frame on
 * canvas.
 *
 * Unsplash is searched without an orientation, so the photo is usually 3:2
 * landscape and sometimes portrait. 4:3 at a narrower measure loses only a sliver
 * of a landscape photo and keeps a portrait one recognisable.
 */
function PhotoSection({ photo }: { photo: TripPhoto }) {
  return (
    <Section ground="bg-sorbet-canvas">
      <Reveal>
        <div className="relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-[2rem]">
          <Image
            src={photo.src}
            alt=""
            fill
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      </Reveal>
    </Section>
  );
}

export default PhotoSection;
