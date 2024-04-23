import NotFoundComponent from "@/components/ui/ErrorComponent";
import { Button } from "@nextui-org/react";
import Link from "next/link";

function NotFound() {
  return (
    <NotFoundComponent
      message="This page actually doesn't exist."
      path="/home"
      button="Back to home"
    />
  );
}

export default NotFound;
