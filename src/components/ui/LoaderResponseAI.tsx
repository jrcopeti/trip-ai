import { PuffLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};
const messages = [
  "Planning your trip",
  "Please Wait",
  "Analyzing your preferences",
  "Getting the best tours",
  "Checking the weather",
  "Packing your stuff",
  "We are almost there",
  "Thank you for using Trip AI",
];

function LoaderResponseAI() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2800);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="fixed left-0 top-0 z-[99] flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-neptune-100 to-yellorange-100">
      <div className="flex flex-col items-center gap-5">
        <div>
          <PuffLoader size={80} color="#4e888c" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={messages.at(index)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 1.3, ease: "easeInOut" }}
            className="mt-10 h-16 text-center text-4xl font-bold text-tuna-900"
          >
            <h2>{messages.at(index)}</h2>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LoaderResponseAI;
