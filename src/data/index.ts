import image1 from "@/assets/homepage/1.jpg";
import image2 from "@/assets/homepage/2.jpg";
import image3 from "@/assets/homepage/3.jpg";
import image4 from "@/assets/homepage/4.jpg";
import image5 from "@/assets/homepage/5.jpg";
import image6 from "@/assets/homepage/6.jpeg";
import image7 from "@/assets/homepage/7.jpg";
import image8 from "@/assets/homepage/8.jpg";
import image9 from "@/assets/homepage/9.jpg";
import image10 from "@/assets/homepage/10.jpg";

const types = [
  { value: "family", label: "Family" },
  { value: "adventure", label: "Adventure" },
  { value: "romantic", label: "Romantic" },
  { value: "solo", label: "Solo" },
  { value: "business", label: "Business" },
  { value: "cultural", label: "Cultural" },
  { value: "festival", label: "Festival" },
  { value: "gastronomy", label: "Gastronomy" },
  { value: "nature", label: "Nature" },
  { value: "urban", label: "Urban" },
];
const sortedTypes = [...types.sort((a, b) => a.label.localeCompare(b.label))];

const luggageSizes = [
  { value: "backpack", label: "Backpack" },
  { value: "carry-on", label: "Carry-on" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const accommodations = [
  { value: "hotel", label: "Hotel" },
  { value: "private acommodation", label: "Private Accomodation" },
  { value: "hostel", label: "Hostel" },
  { value: "apartment", label: "Apartment" },
  { value: "friend's house", label: "Friend's Place" },
  { value: "bed and breakfast", label: "Bed and Breakfast" },
  { value: "resort", label: "Resort" },
  { value: "cabin", label: "Cabin" },
  { value: "camping", label: "Camping" },
];
const sortedAccommodations = [
  ...accommodations.sort((a, b) => a.label.localeCompare(b.label)),
];

const budgets = [
  { value: "low-budget", label: "Low Budget" },
  { value: "comfort", label: "Comfort" },
  { value: "luxury", label: "Luxury" },
];

const interests = [
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "history", label: "History" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "art", label: "Art" },
  { value: "wildlife", label: "Wildlife" },
  { value: "nightlife", label: "Beach" },
  { value: "photography", label: "Photography" },
  { value: "museums", label: "Museums" },
  { value: "wine", label: "Wine" },
  { value: "coffee", label: "Coffee" },
  { value: "wellness", label: "Wellness" },
  { value: "dating", label: "Dating" },
  { value: "music", label: "Music" },
  { value: "hiking", label: "Hiking" },
  { value: "surfing", label: "Surfing" },
  { value: "sports", label: "Sports" },
  { value: "cinema", label: "Cinema" },
  { value: "dance", label: "Dance" },
  { value: "books", label: "Books" },
  { value: "politics", label: "Politics" },
  { value: "architecture", label: "Architecture" },
  { value: "games", label: "Games" },
];
const sortedInterest = [
  ...interests.sort((a, b) => a.label.localeCompare(b.label)),
];

const transports = [
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Plane" },
  { value: "boat", label: "Boat" },
  { value: "car-riding", label: "Car Riding" },
  { value: "bicycle", label: "Bicycle" },
  { value: "motorcycle", label: "Motorcycle" },
];

const sortedTransports = [
  ...transports.sort((a, b) => a.label.localeCompare(b.label)),
];

const homepageImages = [
  {
    src: image1,
    alt: "first",
    city: "Berlin",
    title: "discover the unseen",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AOzn0v/55v//7P//6wDItJvl0bns3cbj2sUAGQAAOSUYMigfEg4LMRwWIdN3vREAAAAASUVORK5CYII=",
  },
  {
    src: image2,
    alt: "second",
    city: "Paris",
    title: "go beyond the horizon",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nGNoVuMskmNo8jZakOHL0KQrZM/OYCvNWWApyxCsI+mnJuUvwnChKYhBhoFBgYEhxlD6/6dLAC+kDJm5EugJAAAAAElFTkSuQmCC",
  },
  {
    src: image3,
    alt: "third",
    city: "London",
    title: "explore the world",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AHTV53Xc7VzF1wDM///E9//K//8Ag31tgHZmioV0ABYAADsoCUcwD/MKFAd4tFeYAAAAAElFTkSuQmCC",
  },
  {
    src: image4,
    alt: "fourth",
    city: "New York",
    title: "embrace the adventure",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNYceLu6Wc/Xv3/zzAzK3xORdqDR/cZTO3MHB2stWwcGBjEGRgUVBk4JQC3DQ/c3oLnaQAAAABJRU5ErkJggg==",
  },
  {
    src: image5,
    alt: "fifth",
    city: "Tokyo",
    title: "experience the culture",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGOY2ZZ1/PrVl///v/v4mqEpPyTAUdrfQUZLloEh1EXTUI7BXJ1BhoEBAH93DhyQDeoiAAAAAElFTkSuQmCC",
  },
  {
    src: image6,
    alt: "sixth",
    city: "Rome",
    title: "taste new flavors",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AHdcWIl1c+r//8fHzgBpLw6gb1Z6YlwmAAAAtKGK5tC6xq6RkXtfdF0TCfd4lUUAAAAASUVORK5CYII=",
  },
  {
    src: image7,
    alt: "seventh",
    city: "Barcelona",
    title: "seek other paths",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGPIKij8/vf/9Yevtu49yCCgIBQe65eQFMYgzsAgycagysSgxsAgysAAAFe5DAgF4waAAAAAAElFTkSuQmCC",
  },
  {
    src: image8,
    alt: "eighth",
    city: "Istanbul",
    title: "find your own way",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/ALu0qvPm3//9+wCqm5HLtq22pJ8AgnZzhHlwY1VNAJSAfRUAAJ2Mi++tFP0r2jShAAAAAElFTkSuQmCC",
  },
  {
    src: image9,
    alt: "ninth",
    city: "Rio de Janeiro",
    title: "discover the unknown",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGP48+fV6ycX7948zuBmq63AzmCkKcFgpi0pychgqizAEOJnExfmZGEgCwBW/wydcsDEeAAAAABJRU5ErkJggg==",
  },
  {
    src: image10,
    alt: "tenth",
    city: "Sydney",
    title: "create your own story",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AO72/+nu//T+/8Pe/wCtiH+Sdm2XenOofnMAch4AYBIAPAAATwAA9/0THu/nSesAAAAASUVORK5CYII=",
  },
];

const steps = [
  {
    id: "step 1",
    title: "Personal Information",
    subtitle: "Let's get to know you better!",
    stepValue: 0,
    fields: ["userName", "age", "nationality"],
  },
  {
    id: "step 2",
    title: "Destination",
    subtitle: "What's your next trip?",
    stepValue: 16,
    fields: ["city", "country"],
  },
  {
    id: "step 3",
    title: "Travel Details",
    subtitle: "How do you like to travel?",
    stepValue: 32,
    fields: ["type", "luggageSize", "accommodation", "budget", "transport"],
  },
  {
    id: "step 4",
    title: "Required Items",
    subtitle: "Items you can't forget!",
    stepValue: 48,
    fields: [],
  },
  {
    id: "step 5",
    title: "Dates and Weather",
    subtitle:
      "Choose between travel plans based on the weather forecast or on actual dates",
    stepValue: 64,
    fields: ["startDate", "endDate"],
  },
  {
    id: "step 6",
    title: "Interests and Notes",
    subtitle: "What you like to do and any special requests",
    stepValue: 80,
    fields: ["interests"],
  },
  {
    id: "step 7",
    title: "Review and Submit",
    subtitle: "Check your details and get your trip plan!",
    stepValue: 100,
    fields: [],
  },
];

const savedTripDataCards = [
  {
    id: 1,
    city: "Berlin",
    country: "Germany",
    userName: "John Doe",
    image: image1,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AOzn0v/55v//7P//6wDItJvl0bns3cbj2sUAGQAAOSUYMigfEg4LMRwWIdN3vREAAAAASUVORK5CYII=",
  },
  {
    id: 2,
    city: "Paris",
    country: "France",
    userName: "Jane Doe",
    image: image2,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nGNoVuMskmNo8jZakOHL0KQrZM/OYCvNWWApyxCsI+mnJuUvwnChKYhBhoFBgYEhxlD6/6dLAC+kDJm5EugJAAAAAElFTkSuQmCC",
  },
  {
    id: 3,
    city: "London",
    country: "United Kingdom",
    userName: "Peter",
    image: image3,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AHTV53Xc7VzF1wDM///E9//K//8Ag31tgHZmioV0ABYAADsoCUcwD/MKFAd4tFeYAAAAAElFTkSuQmCC",
  },
  {
    id: 4,
    city: "New York",
    country: "United States",
    userName: "Laura",
    image: image4,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNYceLu6Wc/Xv3/zzAzK3xORdqDR/cZTO3MHB2stWwcGBjEGRgUVBk4JQC3DQ/c3oLnaQAAAABJRU5ErkJggg==",
  },
  {
    id: 5,
    city: "Tokyo",
    country: "Japan",
    userName: "Grace",
    image: image5,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGOY2ZZ1/PrVl///v/v4mqEpPyTAUdrfQUZLloEh1EXTUI7BXJ1BhoEBAH93DhyQDeoiAAAAAElFTkSuQmCC",
  },
  {
    id: 6,
    city: "Rome",
    country: "Italy",
    userName: "Wayne",
    image: image6,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AHdcWIl1c+r//8fHzgBpLw6gb1Z6YlwmAAAAtKGK5tC6xq6RkXtfdF0TCfd4lUUAAAAASUVORK5CYII=",
  },
  {
    id: 7,
    city: "Barcelona",
    country: "Spain",
    userName: "Florian",
    image: image7,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGPIKij8/vf/9Yevtu49yCCgIBQe65eQFMYgzsAgycagysSgxsAgysAAAFe5DAgF4waAAAAAAElFTkSuQmCC",
  },
  {
    id: 8,
    city: "Istanbul",
    country: "Turkey",
    userName: "Sara",
    image: image8,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/ALu0qvPm3//9+wCqm5HLtq22pJ8AgnZzhHlwY1VNAJSAfRUAAJ2Mi++tFP0r2jShAAAAAElFTkSuQmCC",
  },
  {
    id: 9,
    city: "Rio de Janeiro",
    country: "Brazil",
    userName: "Alex",
    image: image9,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGP48+fV6ycX7948zuBmq63AzmCkKcFgpi0pychgqizAEOJnExfmZGEgCwBW/wydcsDEeAAAAABJRU5ErkJggg==",
  },
  {
    id: 10,
    city: "Sydney",
    country: "Australia",
    userName: "Mia",
    image: image10,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AO72/+nu//T+/8Pe/wCtiH+Sdm2XenOofnMAch4AYBIAPAAATwAA9/0THu/nSesAAAAASUVORK5CYII=",
  },
  {
    id: 11,
    city: "Berlin",
    country: "Germany",
    userName: "John Doe",
    image: image1,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AOzn0v/55v//7P//6wDItJvl0bns3cbj2sUAGQAAOSUYMigfEg4LMRwWIdN3vREAAAAASUVORK5CYII=",
  },
  {
    id: 12,
    city: "Paris",
    country: "France",
    userName: "Jane Doe",
    image: image2,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nGNoVuMskmNo8jZakOHL0KQrZM/OYCvNWWApyxCsI+mnJuUvwnChKYhBhoFBgYEhxlD6/6dLAC+kDJm5EugJAAAAAElFTkSuQmCC",
  },
  {
    id: 13,
    city: "London",
    country: "United Kingdom",
    userName: "Peter",
    image: image3,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AHTV53Xc7VzF1wDM///E9//K//8Ag31tgHZmioV0ABYAADsoCUcwD/MKFAd4tFeYAAAAAElFTkSuQmCC",
  },
  {
    id: 14,
    city: "New York",
    country: "United States",
    userName: "Laura",
    image: image4,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNYceLu6Wc/Xv3/zzAzK3xORdqDR/cZTO3MHB2stWwcGBjEGRgUVBk4JQC3DQ/c3oLnaQAAAABJRU5ErkJggg==",
  },
  {
    id: 15,
    city: "Tokyo",
    country: "Japan",
    userName: "Grace",
    image: image5,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGOY2ZZ1/PrVl///v/v4mqEpPyTAUdrfQUZLloEh1EXTUI7BXJ1BhoEBAH93DhyQDeoiAAAAAElFTkSuQmCC",
  },
  {
    id: 16,
    city: "Rome",
    country: "Italy",
    userName: "Wayne",
    image: image6,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AHdcWIl1c+r//8fHzgBpLw6gb1Z6YlwmAAAAtKGK5tC6xq6RkXtfdF0TCfd4lUUAAAAASUVORK5CYII=",
  },
  {
    id: 17,
    city: "Barcelona",
    country: "Spain",
    userName: "Florian",
    image: image7,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGPIKij8/vf/9Yevtu49yCCgIBQe65eQFMYgzsAgycagysSgxsAgysAAAFe5DAgF4waAAAAAAElFTkSuQmCC",
  },
  {
    id: 18,
    city: "Istanbul",
    country: "Turkey",
    userName: "Sara",
    image: image8,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/ALu0qvPm3//9+wCqm5HLtq22pJ8AgnZzhHlwY1VNAJSAfRUAAJ2Mi++tFP0r2jShAAAAAElFTkSuQmCC",
  },
  {
    id: 19,
    city: "Rio de Janeiro",
    country: "Brazil",
    userName: "Alex",
    image: image9,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGP48+fV6ycX7948zuBmq63AzmCkKcFgpi0pychgqizAEOJnExfmZGEgCwBW/wydcsDEeAAAAABJRU5ErkJggg==",
  },
  {
    id: 20,
    city: "Sydney",
    country: "Australia",
    userName: "Mia",
    image: image10,
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AO72/+nu//T+/8Pe/wCtiH+Sdm2XenOofnMAch4AYBIAPAAATwAA9/0THu/nSesAAAAASUVORK5CYII=",
  },
];

export {
  sortedTypes,
  luggageSizes,
  sortedAccommodations,
  budgets,
  sortedInterest,
  sortedTransports,
  homepageImages,
  steps,
  savedTripDataCards,
};
