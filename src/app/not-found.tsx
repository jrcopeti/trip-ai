import NotFoundComponent from "@/components/ui/NotFoundComponent";

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
