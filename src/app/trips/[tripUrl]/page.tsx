import { notFound } from "next/navigation";
import { getTripByUrl } from "@/db/actions";
import TripPage from "@/components/trips/TripPage";
import SaveSection from "@/components/trips/SaveSection";

async function GeneratedTripPage({ params }: PageProps<"/trips/[tripUrl]">) {
  const { tripUrl } = await params;
  const trip = await getTripByUrl(tripUrl);
  if (!trip) notFound();

  return (
    <TripPage
      trip={trip}
      closing={
        <SaveSection
          tripUrl={trip.tripUrl}
          saved={trip.saved}
          image={trip.tripImages[4]}
          placeholder={trip.placeholder}
          tip={trip.tip}
        />
      }
    />
  );
}

export default GeneratedTripPage;
