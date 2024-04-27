import { BiMessageSquareDots } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

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
      className="inset-0 z-50 flex items-center justify-center"
    >
      <div className="rounded-md bg-gallery-100 p-4 shadow-lg">
        <h2 className=" flex items-center gap-2 text-base font-semibold text-tuna-900">
          <BiMessageSquareDots color="#4e888c" size={22} /> {message}
        </h2>
      </div>
    </motion.div>
  );
}

export default CustomToaster;
