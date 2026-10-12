"use client";
import { notFound } from "next/navigation";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useConfirmOnPageExit } from "@/hooks/useConfirmonPageExit";

import TripPage from "./TripPage";
import SaveSection from "./SaveSection";
import Loader from "../ui/Loader";
import NotFoundComponent from "../ui/NotFoundComponent";
import { states } from "./content";

function TripResponse() {
  const { tripData: trip, isPendingResponseAI } = useTripResponse();
  useConfirmOnPageExit();

  if (isPendingResponseAI) {
    return <Loader />;
  }

  if (trip === null) {
    return (
      <NotFoundComponent
        message={states.generationFailed.message}
        path={states.generationFailed.path}
        button={states.generationFailed.button}
      />
    );
  }

  if (trip === undefined) {
    console.log("trip === undefined");
    notFound();
  }

  return <TripPage closing={<SaveSection />} />;
}

export default TripResponse;
