"use client";
import { motion } from "framer-motion";
import { useFormSteps } from "@/hooks/useFormData";
import FormTitle from "./FormTitle";

/**
 * One step's frame: the title, then the fields, sliding in from the side the
 * user is heading. Reduced motion keeps the fade and drops the slide
 * (`MotionProvider`).
 */
function StepPanel({ children }: { children: React.ReactNode }) {
  const { delta } = useFormSteps();

  return (
    <motion.div
      initial={{ x: delta >= 0 ? 40 : -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <FormTitle />
      <div className="mt-10">{children}</div>
    </motion.div>
  );
}

export default StepPanel;
