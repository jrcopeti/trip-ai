import { Button } from "@nextui-org/react";
import Link from "next/link";
import type { NotFoundComponentProps } from "@/types";


function NotFoundComponent({ message, path, button }: NotFoundComponentProps) {
  return (
    <div className="fixed left-0 top-0 z-[99] flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-gallery-100 to-neptune-200">
      <div className="flex flex-col items-center gap-4 p-16">
        <h1 className="text-center text-3xl font-semibold text-tuna-900">
          {message}
        </h1>

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
