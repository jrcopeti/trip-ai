"use client";

import { Button } from "@nextui-org/react";
import { useEffect } from "react";
import { MdOutlineErrorOutline } from "react-icons/md";
import NotFound from "./not-found";
import NotFoundComponent from "@/components/ui/NotFoundComponent";

export default function Error() {
  return (
    <NotFoundComponent
      message="Something went wrong."
      path="/"
      button="Back to Home"
    />
  );
}
