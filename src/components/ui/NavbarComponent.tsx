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
        className="flex max-w-full bg-gradient-to-r from-gallery-50 to-gallery-100"
        maxWidth="2xl"
        height="3.5rem"
        shouldHideOnScroll
      >
        <NavbarBrand>
          <Link href="/">
            <p className="flex items-center gap-1 font-bold text-inherit text-neptune-500">
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
              className="font-semibold text-tuna-900"
              href="/"
              aria-current="page"
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link className="font-semibold text-tuna-900" href="/form">
              Form
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="font-semibold text-tuna-900"
              href="/saved-trips"
              aria-current="page"
            >
              Saved Trips
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link className="font-semibold text-tuna-900" href="#">
              About
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
}

export default NavbarComponent;
