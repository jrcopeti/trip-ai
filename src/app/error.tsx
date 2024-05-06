"use client";
import NotFoundComponent from "@/components/ui/NotFoundComponent";

export default function Error({ error }: { error: Error }) {
  return (
    <NotFoundComponent
      message={`Something went wrong! - ${error.message}`}
      path="/"
      button="Back to Home"
    />
  );
}
