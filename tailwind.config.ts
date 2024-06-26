import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
// const defaultTheme = require("tailwindcss/defaultTheme");
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "390px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        gallery: {
          "50": "#f8f8f8",
          "100": "#eeeeee",
          "200": "#dcdcdc",
          "300": "#bdbdbd",
          "400": "#989898",
          "500": "#7c7c7c",
          "600": "#656565",
          "700": "#525252",
          "800": "#464646",
          "900": "#3d3d3d",
          "950": "#292929",
        },
        neptune: {
          "50": "#f3f8f8",
          "100": "#dfedee",
          "200": "#c3ddde",
          "300": "#9ac4c6",
          "400": "#76abae",
          "500": "#4e888c",
          "600": "#447176",
          "700": "#3c5d62",
          "800": "#374e53",
          "900": "#314448",
          "950": "#1d2b2f",
        },
        tuna: {
          "50": "#f6f7f9",
          "100": "#edeef1",
          "200": "#d6dae1",
          "300": "#b3bbc6",
          "400": "#8996a7",
          "500": "#6a788d",
          "600": "#556074",
          "700": "#464f5e",
          "800": "#3c4350",
          "900": "#31363f",
          "950": "#23272e",
        },
        shark: {
          "50": "#f6f7f9",
          "100": "#eceff2",
          "200": "#d4dbe3",
          "300": "#aebccb",
          "400": "#8297ae",
          "500": "#637b94",
          "600": "#4e637b",
          "700": "#405064",
          "800": "#384454",
          "900": "#323c48",
          "950": "#222831",
        },
        yellorange: {
          "50": "#fff7eb",
          "100": "#ffe9c6",
          "200": "#ffd088",
          "300": "#ffaf45",
          "400": "#ff9520",
          "500": "#f97007",
          "600": "#dd4c02",
          "700": "#b73006",
          "800": "#94240c",
          "900": "#7a200d",
          "950": "#460d02",
        },
        deeporange: {
          "50": "#fff3ed",
          "100": "#ffe3d5",
          "200": "#fec3aa",
          "300": "#fd9974",
          "400": "#fb6d48",
          "500": "#f93c16",
          "600": "#ea220c",
          "700": "#c2150c",
          "800": "#9a1312",
          "900": "#7c1312",
          "950": "#430709",
        },
        cabaret: {
          "50": "##fcf3f6",
          "100": "#fae9f0",
          "200": "#f6d4e1",
          "300": "#f0b1c7",
          "400": "#e680a2",
          "500": "#d74b76",
          "600": "#c83a5e",
          "700": "#ac2a48",
          "800": "#8f253c",
          "900": "#772435",
          "950": "#480f1b",
        },
        violay: {
          "50": "#fbf8fb",
          "100": "#f6eff8",
          "200": "#ecdfef",
          "300": "#dfc5e2",
          "400": "#cba2d0",
          "500": "#b37cb9",
          "600": "#975e9b",
          "700": "#7d4b80",
          "800": "#673f69",
          "900": "#573758",
          "950": "#361c36",
        },
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          // ...
          colors: {
            default: "#447176",
            primary: "#4e888c",
            secondary: "#b37cb9",
            success: "#447176",
            warning: "#ff9520",
            danger: "#c2150c",
            foreground: "#3c4350",
          },
        },
      },
    }),
  ],
};

export default config;
