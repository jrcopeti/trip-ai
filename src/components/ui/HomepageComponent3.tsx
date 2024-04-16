import Image from "next/image";
import image1 from "@/assets/1.jpg";

function HomepageComponent3() {
  return (
    <div className="container mx-auto">
      <nav className="flex items-center justify-between p-4 shadow-md">
        nav items
      </nav>

      <div className="relative">
        <Image
          src={image1.src}
          width={1920}
          height={1080}
          className="w-full object-cover"
          alt="Main View"
          style={{ height: "60vh" }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded bg-white p-4 shadow-lg">Content</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomepageComponent3;
