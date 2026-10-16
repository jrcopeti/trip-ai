import ToastCard from "./ToastCard";

/** A toast that tells the traveller something failed; announced as an alert. */
function ErrorToaster({ message }: { message: string }) {
  return <ToastCard message={message} tone="alert" />;
}

export default ErrorToaster;
