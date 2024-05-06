import { Button } from "@nextui-org/react";
import Link from "next/link";
import { BiMessageSquareError } from "react-icons/bi";
import type { NotFoundComponentProps } from "@/types";

function NotFoundComponent({ message, path, button }: NotFoundComponentProps) {
  return (
    <div className="fixed left-0 top-0 z-30 flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-shark-100 to-neptune-200">
      <div className="flex flex-col items-center gap-4 p-16">
        <div className="flex items-center gap-2 text-2xl font-semibold text-tuna-900 lg:text-3xl">
          <span>
            <BiMessageSquareError color="#c2150c" />
          </span>
          <h2 className="text-center">{message}</h2>
        </div>
        <Link href={path}>
          <Button>
            <p className="font-semibold capitalize text-gallery-50">{button}</p>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundComponent;
