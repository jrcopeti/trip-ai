import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

function ButtonBackOutlined({ position }: { position: string }) {
  const router = useRouter();
  return (
    <div>
      <Button
        onClick={router.back}
        className={`bg-transparent  p-1 text-xl font-semibold text-neptune-500 xs:text-3xl ${position} z-40 md:text-4xl xl:text-4xl`}
      >
        <span>

          <IoArrowBack />
        </span>
      </Button>
    </div>
  );
}

export default ButtonBackOutlined;
