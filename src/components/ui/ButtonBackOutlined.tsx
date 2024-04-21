import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

function ButtonBackOutlined({ position }: { position: string }) {
  const router = useRouter();
  return (
    <div>
      <Button
        onClick={router.back}
        className={`p-1  text-xl xs:text-3xl font-semibold text-neptune-500 bg-transparent ${position} md:text-4xl xl:text-4xl z-40`}
      >
        <span>
          {" "}
          <IoArrowBack />{" "}
        </span>{" "}
      </Button>
    </div>
  );
}

export default ButtonBackOutlined;
