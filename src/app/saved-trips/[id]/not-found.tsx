import NotFoundComponent from "@/components/ui/NotFoundComponent";

function NotFound() {
  return (
    <NotFoundComponent
      message="Seems that this trip doesn't exist."
      path="/saved-trips"
      button="Back to saved trips"
    />
  );
}

export default NotFound;
