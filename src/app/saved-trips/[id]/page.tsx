import { notFound } from "next/navigation";
import { getSingleSavedTrip } from "@/db/actions";
import TripPage from "@/components/trips/TripPage";
import FinalSection from "@/components/trips/FinalSection";
import { tripPhoto } from "@/components/trips/tripPhoto";
import ButtonBackOutlined from "@/components/ui/ButtonBackOutlined";

async function SavedTripPage({ params }: PageProps<"/saved-trips/[id]">) {
  const { id } = await params;
  const trip = await getSingleSavedTrip(id);
  if (!trip) notFound();

  return (
    <TripPage
      trip={trip}
      before={
        <div className="absolute inset-x-0 top-6 px-5 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <ButtonBackOutlined position="relative" />
          </div>
        </div>
      }
      closing={
        <FinalSection photo={tripPhoto(trip, "closing")} tip={trip.tip} />
      }
    />
  );
}

export default SavedTripPage;
