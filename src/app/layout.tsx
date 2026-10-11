import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Inter,
  League_Spartan,
  Red_Hat_Display,
  Rubik,
} from "next/font/google";

import "./globals.css";
import Providers from "@/app/providers";
import SiteNav from "@/components/ui/SiteNav";

export const inter = Inter({ subsets: ["latin"] });
export const leagueSpartan = League_Spartan({ subsets: ["latin"] });
export const redHatDisplay = Red_Hat_Display({ subsets: ["latin"] });
export const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-rubik",
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
    // falling back to Red Hat Display. See design-notes gotcha #1.
    <html
      lang="en"
      className={`${rubik.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      {/*
        The canvas ground moves to <body> now the nav is shared: the sticky bar
        is `bg-sorbet-canvas/90`, and over a white body those 10% read as a pale
        band across the top of the page. Unmigrated routes paint their own
        opaque full-viewport gradient over this, so nothing there changes.
      */}
      <body className={`${redHatDisplay.className} bg-sorbet-canvas`}>
        <Providers>
          <SiteNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
