import ToastCard from "./ToastCard";

/** A toast that tells the traveller something went right. */
function CustomToaster({ message }: { message: string }) {
  return <ToastCard message={message} />;
}

export default CustomToaster;
