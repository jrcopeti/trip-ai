import type { ContainerProps } from "@/types";

/**
 * Full-viewport panel from the previous look. Not for migrated pages — it locks
 * its children to one non-scrolling screen. The 4rem is the shared nav's height.
 */

function Container({
  children,
  overflow = "",
  height = "h-[calc(100vh-4rem)]",
  animationClass = "",
}: ContainerProps) {
  return (
    <div
      className={`${animationClass} relative flex ${height} items-center justify-center ${overflow}`}
    >
      {children}
    </div>
  );
}

export default Container;
