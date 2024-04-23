import NotFoundComponent from "@/components/ui/ErrorComponent";

function NotFound() {
  return (
    <NotFoundComponent
      message="error response AI in TRIP RESPONSE"
      path="/trips"
      button="TRIPS"
    />
  );
}

export default NotFound;
