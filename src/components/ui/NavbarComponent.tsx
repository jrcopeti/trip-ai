"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/assets/travel/logo.png";

function NavbarComponent() {
  const pathname = usePathname();

  // /landing-v2 ships its own nav in the Buddy design system.
  if (pathname?.startsWith("/landing-v2")) return null;

  return (
    <nav className="z-50 flex h-14 max-w-full items-center bg-gradient-to-r from-gallery-100 to-gallery-200 px-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-xs font-bold text-neptune-500 xs:text-sm sm:text-base"
      >
        <Image width={35} height={35} alt="Trip AI" src={logo} />
        <p>Trip AI</p>
      </Link>
      <div className="flex flex-1 items-center justify-center gap-8">
        <Link
          className="hidden text-xs font-semibold text-tuna-900 xs:text-sm sm:block sm:text-base"
          href="/"
        >
          Home
        </Link>
        <Link
          className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
          href="/form"
        >
          New Trip
        </Link>
        <Link
          className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
          href="/saved-trips"
        >
          Saved Trips
        </Link>
        <Link
          className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
          href="/about"
        >
          About
        </Link>
      </div>
    </nav>
  );
}

export default NavbarComponent;
