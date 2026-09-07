import type { Metadata } from "next";
import { Inter, League_Spartan, Red_Hat_Display, Rubik } from "next/font/google";

import "./globals.css";
import Providers from "@/app/providers";
import NavbarComponent from "@/components/ui/NavbarComponent";

export const inter = Inter({ subsets: ["latin"] });
export const leagueSpartan = League_Spartan({ subsets: ["latin"] });
export const redHatDisplay = Red_Hat_Display({ subsets: ["latin"] });
export const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-rubik",
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
    <html lang="en" className={rubik.variable} suppressHydrationWarning>
      <body className={redHatDisplay.className}>
        <NavbarComponent />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
