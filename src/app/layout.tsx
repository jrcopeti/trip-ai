import type { Metadata } from "next";
import { Inter, League_Spartan, Red_Hat_Display  } from "next/font/google";

import "./globals.css";
import Providers from "@/app/providers";

export const inter = Inter({ subsets: ["latin"] });
export const leagueSpartan = League_Spartan({ subsets: ["latin"] });
export const redHatDisplay = Red_Hat_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body className={redHatDisplay.className} >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

