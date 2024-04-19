import type { ContainerProps } from "@/types";

function Container({ children, overflow, animationClass }: ContainerProps) {
  return (
    <div
      className={`${animationClass} relative flex h-[calc(100dvh-3.5rem)] items-center justify-center ${overflow}`}
    >
      {children}
    </div>
  );
}

export default Container;
