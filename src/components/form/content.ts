/**
 * Content for `/form`. Every word on the form lives here; the step components
 * hold only layout and styling. Not here: the option lists the schema reads
 * (`sortedTypes`, `luggageSizes` and the rest stay in `src/data`), and the
 * validation messages, which belong to the schema in `src/lib/schema.ts`.
 */

/** One per step, in order. `src/data`'s `steps` keeps each step's fields. */
export const stepCopy = [
  { title: "Personal information", subtitle: "Let's get to know you better." },
  { title: "Destination", subtitle: "Where's your next trip?" },
  { title: "Travel details", subtitle: "How do you like to travel?" },
  { title: "Required items", subtitle: "The things you can't forget." },
  {
    title: "Dates and weather",
    subtitle: "Plan around the forecast, or around your actual dates.",
  },
  {
    title: "Interests and notes",
    subtitle: "What you like to do, and anything special.",
  },
  { title: "Review and submit", subtitle: "Check your details, then get your plan." },
];

export const progress = {
  label: "Form progress",
  step: (current: number, total: number) => `Step ${current} of ${total}`,
};

export const buttons = {
  back: "Back",
  next: "Next",
  submit: "Plan my trip",
};

/** Keyed by any group, so step 1 can look up the chosen one; Family has no hint. */
const ageRangesHint: Partial<Record<string, string>> = {
  solo: "One age range, 13 and up.",
  couple: "Up to two, 18 and up, or one if you're both in the same range.",
  friends: "13 and up.",
  colleagues: "18 and up.",
};

export const personal = {
  name: { label: "Name", placeholder: "What's your name?" },
  travellers: "Who's going?",
  ageRanges: "Ages in the group",
  ageRangesHint,
  passport: {
    label: "Passport (optional)",
    placeholder: "Select a country",
    description: "Only used to look up entry requirements.",
  },
};

export const destination = {
  city: { label: "City", placeholder: "Where are you going?", hint: "Pick a country first." },
  country: { label: "Country", placeholder: "Select a country" },
  checking: "Checking the city",
  found: (name: string, country: string) => `Found ${name}, ${country}`,
  notFound: "We couldn't find that city in this country. Check the spelling?",
  unavailable: "We couldn't check the city just now. Please try again.",
};

export const details = {
  type: "What kind of trip is it?",
  pace: "What pace suits you?",
  accommodation: "Where are you staying?",
  luggageSize: "How big is your luggage?",
  transport: "How are you travelling?",
  budget: "What's your budget?",
};

export const items = {
  label: (n: number) => `Item ${n}`,
  remove: (n: number) => `Remove item ${n}`,
  add: "Add an item",
  full: (max: number) => `That's the most: ${max} items.`,
  empty: "Nothing yet. Add anything you can't travel without.",
};

export const dates = {
  weather: "Plan around the weather",
  weatherNote: "Your plan will follow the forecast for the next 5 days.",
  or: "Or pick your dates",
  start: { label: "Start date", placeholder: "When does your trip start?" },
  end: { label: "End date", placeholder: "When does it end?" },
  clear: (label: string) => `Clear ${label.toLowerCase()}`,
};

export const interests = {
  label: "Pick up to 3 interests",
  notes: { label: "Notes", placeholder: "Anything you'd like to add?" },
};

export const review = {
  labels: {
    name: "Name",
    travellers: "Who's going",
    ageRanges: "Ages",
    passport: "Passport",
    destination: "Destination",
    type: "Trip type",
    pace: "Pace",
    luggageSize: "Luggage",
    budget: "Budget",
    transport: "Transport",
    accommodation: "Accommodation",
    duration: "Duration",
    interests: "Interests",
    requiredItems: "Required items",
    notes: "Notes",
  },
  weatherDuration: "5 days, following the weather",
  none: "—",
  agreement:
    "I agree to share these details with Anthropic to generate the plan, and understand this app is for entertainment only.",
};

export const failure = {
  message: "There was an error generating the trip. Please try again.",
  button: "Try again",
};
