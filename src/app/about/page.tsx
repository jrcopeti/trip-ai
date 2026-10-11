import { connection } from "next/server";

import AboutComponent from "@/components/about/AboutComponent";
import pickAboutImage from "@/components/about/pickAboutImage";

async function page() {
  // Opt into per-request rendering; otherwise the "random" photo is picked
  // once at build time and every visitor gets the same one.
  await connection();

  return <AboutComponent image={pickAboutImage()} />;
}

export default page;
