/**
 * Content for `/about`. Every word on the page lives here; `AboutComponent`
 * holds only layout and styling. The photo is not here: it is picked per request
 * from `travelPhotos` in src/data and arrives with its own alt.
 */

export const intro = {
  eyebrow: "About",
  heading: {
    claim: "About Trip AI.",
    qualifier: "Travel plans that feel personal.",
  },
  lead: "Trip AI makes travel planning fun by creating itineraries that match your preferences. Whether you're after vibrant cities or quiet natural retreats, it keeps the plan simple and personal: tours worth doing, and a list of things to pack that is already adapted to the weather.",
  credit: {
    prefix: "Created by",
    name: "José Copeti",
    href: "https://github.com/jrcopeti",
  },
};

export const closing = {
  heading: "Ready when you are.",
  body: "Tell it where you're going. The rest is on us.",
  cta: { label: "Plan a trip", href: "/form" },
};
