"use client";
import NotFoundComponent from "@/components/ui/NotFoundComponent";

export default function Error({ error }: { error: Error }) {
  console.error(error);
  return (
    <NotFoundComponent
      message={`Something went wrong!`}
      path="/"
      button="Back to Home"
    />
  );
}
