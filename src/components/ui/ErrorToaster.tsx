import { BiMessageSquareX } from "react-icons/bi";
import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * The error twin of `CustomToaster`. Same white card; the red glyph is what
 * distinguishes it, so it keeps its colour.
 */
function ErrorToaster({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: "easeInOut",
      }}
      className="inset-0 z-50 flex items-center justify-center font-sorbet antialiased"
    >
      <div className="rounded-2xl bg-sorbet-white px-5 py-4 shadow-[0_18px_40px_-24px_rgba(48,46,45,0.55)]">
        <h2 className="flex items-center gap-2.5 text-base font-semibold text-sorbet-ink">
          <span aria-hidden className="shrink-0 text-sorbet-alert">
            <BiMessageSquareX size={22} />
          </span>
          {message}
        </h2>
      </div>
    </motion.div>
  );
}

export default ErrorToaster;
