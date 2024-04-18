import fs from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";


const homepageImages = [
  { src: '1.jpg', alt: "first", city: "Berlin", title: "discover the unseen" },
  { src: '2.jpg', alt: "second", city: "Paris", title: "go beyond the horizon" },
  { src: '3.jpg', alt: "third", city: "London", title: "explore the world" },
  { src: '4.jpg', alt: "fourth", city: "New York", title: "embrace the adventure" },
  { src: '5.jpg', alt: "fifth", city: "Tokyo", title: "experience the culture" },
  { src: '6.jpeg', alt: "sixth", city: "Rome", title: "taste new flavors" },
  { src: '7.jpg', alt: "seventh", city: "Barcelona", title: "seek other paths" },
  { src: '8.jpg', alt: "eighth", city: "Istanbul", title: "find your own way" },
  { src: '9.jpg', alt: "ninth", city: "Rio de Janeiro", title: "discover the unknown" },
  { src: '10.jpg', alt: "tenth", city: "Sydney", title: "create your own story" },
];

async function generatePlaceholders() {
  const imagesPath = path.join(process.cwd(), "src", "assets", "homepage");
  const results = [];

  for (const image of homepageImages) {
    const imagePath = path.join(imagesPath, image.src);
    try {
      const file = await fs.readFile(imagePath);
      const { base64 } = await getPlaiceholder(file);
      results.push({
        ...image,
        placeholder: base64,
      });
    } catch (err) {
      console.error(`Failed to generate placeholder for ${image.src}: ${err}`);
    }
  }

  await fs.writeFile("./placeholders.json", JSON.stringify(results, null, 2));
  console.log("Placeholders generated and saved.");
}

generatePlaceholders();
