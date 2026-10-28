import Image from "next/image";
import Reveal from "@/components/sorbet/Reveal";
import { Section } from "./Section";
import type { TripPhoto } from "./tripPhoto";

/** A breather between sections: one photo, centred in a 4:3 frame on canvas. */
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
