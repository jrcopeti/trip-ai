"use client";
import NotFoundComponent from "@/components/ui/NotFoundComponent";

export default function Error() {
  return (
    <NotFoundComponent
      message="Something went wrong!"
      path="/"
      button="Back to Home"
    />
  );
}
