/**
 * Content for `/saved-trips`. Every word on the page lives here; the components
 * hold only layout and styling. The trips themselves are not here: they are rows
 * from the database, captioned with their own city, country and traveller.
 */

export const header = {
  eyebrow: "Saved trips",
  heading: {
    claim: "Where people went.",
    qualifier: "Every trip someone kept.",
  },
  search: {
    label: "Search for a trip",
    placeholder: "A city, country or name",
    clear: "Clear search",
  },
};

/** The sticker turning in the header's bottom-right corner. */
export const badge = {
  label: "trips worth keeping",
};

export const empty = {
  heading: "No trips found",
  body: "Nothing matches that search. Try a city, a country or a traveller's name.",
};

export const more = {
  button: "Show more trips",
  loading: "Loading more trips",
  failed: "Couldn't load more trips. Try again.",
  count: (shown: number, total: number) => `${shown} of ${total} trips`,
};

export const loading = {
  label: "Loading saved trips",
};

export const error = {
  message: "There was an error fetching saved trips. Please try again.",
  button: "Back to Home",
  path: "/",
};
