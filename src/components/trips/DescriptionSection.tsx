import Image from "next/image";
import type { Trip } from "@/generated/prisma/client";
import Reveal from "@/components/sorbet/Reveal";
import { MediaFrame, Paragraphs, Section, SectionHeading } from "./Section";
import { description as copy } from "./content";
import { tripPhoto } from "./tripPhoto";

function DescriptionSection({ trip }: { trip: Trip }) {
  const { description } = trip;
  const photo = tripPhoto(trip, "description");

  return (
    <Section ground="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
          <Reveal delay={0.06}>
            <Paragraphs
              text={description}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-sorbet-ink/75 md:text-xl"
            />
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <MediaFrame>
            <Image
              src={photo.src}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
            />
          </MediaFrame>
        </Reveal>
      </div>
    </Section>
  );
}

export default DescriptionSection;
