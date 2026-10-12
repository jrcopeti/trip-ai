import type { IconType } from "react-icons";
import {
  FaBagShopping,
  FaCamera,
  FaChampagneGlasses,
  FaChildren,
  FaCompass,
  FaHeart,
  FaLandmark,
  FaMasksTheater,
  FaPalette,
  FaPersonHiking,
  FaSpa,
  FaTree,
  FaUtensils,
} from "react-icons/fa6";
import type { TourKind } from "@/lib/tourKinds";

const ICONS: Record<TourKind, IconType> = {
  Food: FaUtensils,
  History: FaLandmark,
  Culture: FaMasksTheater,
  Art: FaPalette,
  Nature: FaTree,
  Adventure: FaPersonHiking,
  Nightlife: FaChampagneGlasses,
  Romantic: FaHeart,
  Shopping: FaBagShopping,
  Relaxation: FaSpa,
  Sightseeing: FaCamera,
  Family: FaChildren,
};

/**
 * The icon for a tour's kind chip. The schema's `enum` is not enforced, so a
 * word outside the list still gets a chip, with a compass.
 */
export function kindIcon(kind: string): IconType {
  const key = Object.keys(ICONS).find((k) => k.toLowerCase() === kind.trim().toLowerCase());
  return key ? ICONS[key as TourKind] : FaCompass;
}
