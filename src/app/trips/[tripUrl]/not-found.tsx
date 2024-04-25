import NotFoundComponent from "@/components/ui/NotFoundComponent";

function NotFound() {
  return (
    <NotFoundComponent
      message="This trip is no longer available."
      path="/"
      button="Back to Home"
    />
  );
}

export default NotFound;
