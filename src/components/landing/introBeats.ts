import { intro } from "./content";

// Beat durations, ms, one per `intro.beats` word. Tune here. A word added
// without one holds for the default rather than flashing past.
const BEAT_HOLDS = [450, 350, 450];
const DEFAULT_HOLD = 450;

export const BEATS = intro.beats.map((text, i) => ({ text, hold: BEAT_HOLDS[i] ?? DEFAULT_HOLD }));
