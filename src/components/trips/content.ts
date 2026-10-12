/**
 * Content for both trip routes, `/trips/[tripUrl]` and `/saved-trips/[id]`. Every
 * word around the trip lives here; the sections hold only layout and styling. The
 * trip itself is not here: it is the AI's `tripData`, the form data and the
 * weather on the generated route, and a `Trip` row on the saved one.
 */

export const title = {
  eyebrow: { generated: "Your trip", saved: "A saved trip" },
  destination: "Destination",
  dates: "Dates",
  traveller: "Traveller",
  byWeather: "The next five days, by the forecast",
};

export const description = {
  eyebrow: "The trip",
  heading: { claim: "What to expect.", qualifier: "In a few lines." },
};

export const tours = {
  eyebrow: "Tours",
  heading: { claim: "Suggested tours.", qualifier: "Pick a few, skip the rest." },
  chip: (n: number) => `Tour ${String(n).padStart(2, "0")}`,
  /** Stands in for a tour's title until the AI returns one. */
  untitled: "Tour title",
  carousel: "Suggested tours",
  slide: (n: number, total: number) => `${n} of ${total}`,
  previous: "Previous tour",
  next: "Next tour",
  goTo: (n: number) => `Go to tour ${n}`,
};

export const packReady = {
  eyebrow: "Packing",
  heading: { claim: "Your pack is ready.", qualifier: "Counted for the days." },
  byWeather: "Based on the weather",
  range: (start: string, end: string) => `From ${start} to ${end}`,
  badge: "packed and ready",
};

export const objects = {
  eyebrow: "What to pack",
  heading: { claim: "The list.", qualifier: "Quantities included." },
  chip: (quantity: number) => `× ${quantity}`,
};

export const mustHave = {
  eyebrow: "Essentials",
  heading: { claim: "Don't leave without these.", qualifier: "Check them twice." },
  mustHave: "Must have",
  required: "You asked for",
  noRequired: "Nothing extra this time.",
};

export const weather = {
  eyebrow: "Weather",
  heading: { claim: "The sky right now.", qualifier: "Where you're going." },
  feelsLike: (t: number) => `Feels like ${t}ºC`,
  low: "Low",
  high: "High",
  metrics: {
    humidity: "Humidity",
    wind: "Wind",
    sunrise: "Sunrise",
    sunset: "Sunset",
  },
  loading: "Loading the weather",
  unavailable: "Weather data is not available",
};

export const forecast = {
  eyebrow: "Forecast",
  heading: { claim: "The next five days.", qualifier: "Day by day." },
  loading: "Loading the forecast",
  unavailable: "Forecast data is not available",
};

export const details = {
  eyebrow: "The details",
  heading: { claim: "What you told us.", qualifier: "The trip was built on this." },
  flag: (country: string) => `Flag of ${country}`,
  labels: {
    destination: "Destination",
    nationality: "Nationality",
    name: "Name",
    type: "Trip type",
    age: "Age",
    budget: "Budget",
    transport: "Transport",
    luggage: "Luggage",
    duration: "Duration",
    accommodation: "Accommodation",
    note: "Notes",
    interests: "Interests",
  },
  byWeather: "5 days based on the weather",
  none: "None",
};

export const closing = {
  eyebrow: "Good to know",
  save: {
    question: "Keep this trip?",
    yes: "Yes, save it",
    no: "No, thanks",
  },
  saved: {
    heading: "What next?",
    view: { label: "View saved trips", href: "/saved-trips" },
    another: { label: "Plan another trip", href: "/form" },
  },
  final: {
    heading: "Where to now?",
    back: "Back",
    another: { label: "Plan another trip", href: "/form" },
  },
};

export const states = {
  generationFailed: {
    message:
      "Seems that there's something wrong with the destination provided. Please try again.",
    path: "/form",
    button: "Back to New Trip",
  },
};
