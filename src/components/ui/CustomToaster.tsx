import { BiMessageSquareDots } from "react-icons/bi";
import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * react-hot-toast renders into a portal at the document root, so this sits
 * outside any page's `font-sorbet` wrapper and has to opt in itself.
 */
function CustomToaster({ message }: { message: string }) {
  return (
    <motion.div
      key="success"
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
          <BiMessageSquareDots aria-hidden size={22} /> {message}
        </h2>
      </div>
    </motion.div>
  );
}

export default CustomToaster;
