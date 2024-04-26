import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const slideUp = {
  initial: {
    y: "0",
  },
  exit: {
    y: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.2 },
  },
};

const words = ["Welcome", "To", "Trip", "AI"];
function Preloader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index === words.length - 1) return;
    setTimeout(
      () => {
        setIndex(index + 1);
      },
      index === 0 ? 900 : 150,
    );
  }, [index]);

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="fixed left-0 top-0 z-50 flex h-dvh w-dvw cursor-wait items-center justify-center bg-gradient-to-b from-violay-200 to-neptune-200"
    >
      <motion.p
        className="text-5xl font-bold text-tuna-900 "
        variants={opacity}
        initial="initial"
        animate="enter"
      >
        {words[index]}
      </motion.p>
    </motion.div>
  );
}

export default Preloader;
