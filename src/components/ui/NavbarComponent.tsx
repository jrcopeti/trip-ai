import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { PiSuitcase } from "react-icons/pi";

function NavbarComponent() {
  return (
    <>
      <Navbar
        className="flex max-w-full bg-gradient-to-r from-gallery-100 to-gallery-200"
        maxWidth="2xl"
        height="3.5rem"
        shouldHideOnScroll
      >
        <NavbarBrand>
          <Link href="/">
            <p className="flex items-center gap-1 text-xs xs:text-sm font-bold text-inherit text-neptune-500 sm:text-base">
              {" "}
              <span>
                <PiSuitcase size={30} />
              </span>
              Trip AI
            </p>
          </Link>
        </NavbarBrand>
        <NavbarContent className="flex gap-8" justify="center">
          <NavbarItem>
            <Link
              className="hidden text-xs xs:text-sm font-semibold text-tuna-900 sm:block sm:text-base"
              href="/"
              aria-current="page"
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs xs:text-sm font-semibold text-tuna-900 sm:text-base"
              href="/form"
            >
             New Trip
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs xs:text-sm font-semibold text-tuna-900 sm:text-base"
              href="/saved-trips"
              aria-current="page"
            >
              Saved Trips
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-xs xs:text-sm font-semibold text-tuna-900 sm:text-base"
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
