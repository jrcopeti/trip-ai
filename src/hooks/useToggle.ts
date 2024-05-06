import { useState } from "react";
import type { ToggleActions } from "@/types";

export function useToggle(initialValue = false): [boolean, ToggleActions] {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = () => setIsOpen(!isOpen);

  const setVisible = (visible: boolean) => setIsOpen(visible);

  const actions = {
    setVisible,
    onHidden: () => setIsOpen(false),
  };

  return [isOpen, actions];
}
