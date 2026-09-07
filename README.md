# Trip-Ai

https://trip-ai-weld.vercel.app/

> ### 🚧 Work in progress — redesign underway
>
> Trip AI is being rebuilt visually. The **landing page is an alpha preview of the new
> design system** and is the only page redesigned so far. The rest of the app — the trip
> form, the generated trip page, and saved trips — still uses the previous styling, so
> you will see two different looks as you move through it.
>
> Everything is functional; this is a visual migration, not a rewrite. The remaining
> pages are being moved over to the new system next.

Trip AI makes travel planning fun by creating customized itineraries that match your preferences.
Whether you're looking to explore vibrant cities or quiet natural retreats, Trip AI make travel plans simple and personal. It offers detailed tours suggestions and a list of things to pack, all adapted to the weather.

This full-stack application, built with TypeScript and Next.js, highlights the capabilities of modern web development. By using multiple APIs, Trip AI combines many features to provide a engaging user experience.

## Features

- **AI Powered Travel Guide** - Trip AI uses Anthropic's Claude to generate personalized travel itineraries based on your preferences.
- **Customized Itineraries** - It creates customized itineraries based on your preferences, including the number of days you plan to travel, your budget, and your interests.
- **Weather Adapted Packing List** - Trip AI generates a packing list based on the weather forecast for your destination, so you'll always be prepared for your trip. Also provides a current and 5-day weather forecast for your destination.
- **Save Itineraries** - Trip AI allows you to save your trip itineraries so you can access them later. It includes a search feature to help finding saved trips quickly.

## The redesign

The new landing page is built around a warm neutral canvas, pastel activity cards, and a
single characterful display face. The type is [Rubik](https://fonts.google.com/specimen/Rubik);
colour and shape are defined as design tokens in `src/app/globals.css` and applied through
components in `src/components/landing/`.

Two details worth calling out:

- **The trip-type chips are real data.** They render the same taxonomy the trip form
  accepts (`sortedTypes` in `src/data`), rather than invented sample labels.
- **Reduced motion is respected.** The rotating badges and scroll parallax stop for anyone
  whose system asks for less motion, without leaving content hidden.

### Landing page — desktop

![Landing hero](public/screenshots/redesign/desktop-hero.png)
![Trip types](public/screenshots/redesign/desktop-types.png)
![Itinerary cards](public/screenshots/redesign/desktop-cards.png)
![Weather and packing list](public/screenshots/redesign/desktop-weather.png)
![Closing call to action](public/screenshots/redesign/desktop-cta.png)

### Landing page — mobile

<p>
  <img src="public/screenshots/redesign/mobile-hero.png" alt="Landing hero on mobile" width="300">
  <img src="public/screenshots/redesign/mobile-weather.png" alt="Weather card on mobile" width="300">
</p>

## Tech Stack

- **Next.js 16** - to build a full-stack application with React 19.
- **TypeScript** - for improving code quality by adding static types.
- **TanStack Query** - to manage server state, in the database and API requests, and to cache data.
- **Context API** - for making state available throughout the application without prop drilling.
- **Tailwind CSS v4** - to style the application quickly and responsively, with the design tokens defined CSS-first in `globals.css`.
- **HeroUI v3** - for accessible base components.
- **React Hook Form** - for managing form state.
- **Axios** - for making REST APIs requests with ease.
- **Zod** - to validate data and ensure data integrity.
- **Prisma** - to interact with the database.
- **Postgres** - as database choice.
- **Anthropic API** - Claude generates the itineraries, tours and packing lists.
- **OpenWeather API** - to get weather data.
- **Swiperjs** - to create nice sliding pictures.
- **GSAP Animation and Framer Motion** - to create scroll animations and transitions.
- **react-icons** - for iconography across the app.

## Running locally

```bash
npm install
npm run dev
```

The following environment variables are required in `.env.local`:

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `ANTHROPIC_API_KEY` | Itinerary generation |
| `UNSPLASH_API_KEY` | Destination photography |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | Weather and forecast |
| `NEXT_PUBLIC_GEONAMES_USERNAME` | City validation |

## Previous design

These screenshots show the app before the redesign. Most of the app still looks like this
while the migration is in progress.

### Desktop View

![Desktop View](public/screenshots/desktop/1.png)
![Desktop View](public/screenshots/desktop/2.png)
![Desktop View](public/screenshots/desktop/3.png)
![Desktop View](public/screenshots/desktop/4a.png)
![Desktop View](public/screenshots/desktop/5.png)
![Desktop View](public/screenshots/desktop/6.png)
![Desktop View](public/screenshots/desktop/7.png)
![Desktop View](public/screenshots/desktop/8.png)
![Desktop View](public/screenshots/desktop/9.png)
![Desktop View](public/screenshots/desktop/10.png)

### Mobile View

![Mobile View](public/screenshots/mobile/1a.png)
![Mobile View](public/screenshots/mobile/2a.png)
![Mobile View](public/screenshots/mobile/3a.png)
![Mobile View](public/screenshots/mobile/4a.png)
![Mobile View](public/screenshots/mobile/5a.png)
![Mobile View](public/screenshots/mobile/6a.png)
![Mobile View](public/screenshots/mobile/7a.png)
![Mobile View](public/screenshots/mobile/8a.png)
![Mobile View](public/screenshots/mobile/9a.png)
![Mobile View](public/screenshots/mobile/10a.png)
