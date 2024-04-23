import NotFoundComponent from "@/components/ui/ErrorComponent";

function NotFound() {
  return (
    <NotFoundComponent
      message="Seems that this trip is not available."
      path="/saved-trips"
      button="Back to saved trips"
    />
  );
}

export default NotFound;
