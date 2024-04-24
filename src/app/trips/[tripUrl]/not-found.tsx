import NotFoundComponent from "@/components/ui/ErrorComponent";

function NotFound() {
  return (
    <NotFoundComponent
      message="error response AI in TRIP RESPONSE PAGE"
      path="/trips"
      button="TRIPS"
    />
  );
}

export default NotFound;
