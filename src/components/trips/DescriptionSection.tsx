import { useParams } from "next/navigation";
import Image from "next/image";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import defaultImage2 from "@/assets/travel-photos/2.jpg";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { MediaFrame, Section, SectionHeading } from "./Section";
import { description as copy } from "./content";

function DescriptionSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { imageData } = useImage();

  const description = trip?.description || response?.description;
  const image2 = trip?.image2 || imageData?.tripImage2;
  const placeholder = trip?.placeholder || imageData?.placeholder;

  return (
    <Section ground="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
          <Reveal delay={0.06}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-sorbet-ink/75 md:text-xl">
              {description}
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <MediaFrame>
            <Image
              src={image2 ?? defaultImage2}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={placeholder ?? defaultPlaceholder}
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
