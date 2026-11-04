import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Providers from "@/app/providers";
import SiteNav from "@/components/ui/SiteNav";

// Self-hosted so a build fetches nothing: the box's firewall blocks Google Fonts.
// Two files under one family. OFL, licence beside them. See design-notes, Typography.
export const rubik = localFont({
  src: "../assets/fonts/rubik-latin-wght.woff2",
  weight: "400 800",
  variable: "--font-rubik",
  declarations: [{ prop: "font-family", value: "Rubik" }],
});
// Not preloaded: the browser fetches it only for a character in this range.
// Without the shared `font-family` these characters would skip Rubik altogether.
export const rubikExtended = localFont({
  src: "../assets/fonts/rubik-extended-wght.woff2",
  weight: "400 800",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "Rubik" },
    {
      prop: "unicode-range",
      value:
        "U+0100-0130,U+0132-0151,U+0154-0192,U+01FC-0237,U+02C7,U+02DD,U+0307,U+0400-04F9,U+051A-0525,U+05B0-06CC,U+06F0-06F9,U+1E80-1E9E,U+1EF2-1EF3,U+20AA,U+20AE-20BD,U+2116,U+FB2A-FB59,U+FB7B-FB9F,U+FBFD-FC96,U+FCFB-FD3F",
    },
  ],
});
// The one exception to "Rubik is the display face": polaroid captions are
// handwritten. Exposed as `font-sorbet-hand`.
//
// Self-hosted rather than `next/font/google`: Google sometimes serves Caveat
// from `fonts.gstatic.com/l/font?kit=…&skey=…`, and Turbopack's font loader
// fails on a URL with more than one query parameter ("next/font/google queries
// have exactly one entry"), so `next dev` loses the font. One variable file,
// latin subset, covers 400–700. OFL, licence beside it.
export const caveat = localFont({
  src: "../assets/fonts/caveat-latin-wght.woff2",
  weight: "400 700",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Trip AI",
  description: "The travel guide powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Both font variables belong on <html>, not <body>: `--font-sorbet` and
    // `--font-sorbet-hand` are defined on `:root` inside @theme, and a var()
    // that resolves one level below where it is declared is invalid — silently
    // falling back to the browser's default face. See design-notes gotcha #1.
    <html
      lang="en"
      className={`${rubik.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      {/*
        The canvas ground moves to <body> now the nav is shared: the sticky bar
        is `bg-sorbet-canvas/90`, and over a white body those 10% read as a pale
        band across the top of the page.
      */}
      <body className="bg-sorbet-canvas font-sorbet">
        <Providers>
          <SiteNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
