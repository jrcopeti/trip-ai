import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { PiSuitcase } from "react-icons/pi";
import Image from "next/image";
import logo from "@/assets/travel/logo.png";

function NavbarComponent() {
  return (
    <>
      <Navbar
        className="z-50 flex max-w-full bg-gradient-to-r from-gallery-100 to-gallery-200"
        maxWidth="2xl"
        height="3.5rem"
        shouldHideOnScroll
      >
        <NavbarBrand>
          <Link href="/">
            <div className="flex items-center gap-2 text-xs font-bold text-inherit text-neptune-500 xs:text-sm sm:text-base">
              <Image width={35} height={35} alt="Trip AI" src={logo} />
              <p>Trip AI</p>
            </div>
          </Link>
        </NavbarBrand>
        <NavbarContent className="flex gap-8" justify="center">
          <NavbarItem>
            <Link
              className="hidden text-xs font-semibold text-tuna-900 xs:text-sm sm:block sm:text-base"
              href="/"
              aria-current="page"
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
              href="/form"
            >
              New Trip
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
              href="/saved-trips"
              aria-current="page"
            >
              Saved Trips
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs font-semibold text-tuna-900 xs:text-sm sm:text-base"
              href="/about"
            >
              About
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
}

export default NavbarComponent;
