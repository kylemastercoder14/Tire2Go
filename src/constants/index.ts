import { SearchByCar, SearchBySize } from "@/types";
import { ShieldCheck, Users, BadgeCheck, Car, Handshake } from "lucide-react";

export const SEARCH_BY_CAR: SearchByCar[] = [
  {
    make: "FORD",
    models: {
      EVEREST: [2010, 2011, 2012, 2013, 2014, 2015, 2020],
      EXPLORER: [2010, 2011, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      RAPTOR: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    },
  },
  {
    make: "HONDA",
    models: {
      "BR-V": [2010, 2011, 2012, 2013, 2014, 2015, 2020],
      CIVIC: [2010, 2011, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      CITY: [],
      "CIVIC TYPE R": [2010, 2011, 2012, 2015, 2016, 2017, 2018, 2019, 2020],
      FB: [2011, 2012, 2013, 2014, 2015, 2016],
      FC: [2016, 2017, 2018, 2019, 2020],
      FD: [2006, 2007, 2008, 2009, 2010, 2011],
      INSIGHT: [2009, 2010, 2011, 2012, 2013, 2014, 2019, 2020, 2021, 2022],
      JAZZ: [
        2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
        2016, 2017, 2018, 2019, 2020, 2021,
      ],
      MOBILIO: [2015, 2016, 2017, 2018, 2019, 2020, 2021],
    },
  },
  {
    make: "HYUNDAI",
    models: {
      ACCENT: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      ELANTRA: [
        2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
        2020,
      ],
      EON: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      "GRAND SANTA FE": [2013, 2014, 2015, 2016, 2017, 2018],
      I10: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      KONA: [2017, 2019],
      SONATA: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
      STAREX: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      STARGAZER: [2022, 2023, 2024, 2025],
      TUCSON: [2009, 2010, 2011, 2012, 2013, 2014, 2019],
    },
  },
  {
    make: "MITSUBISHI",
    models: {
      ADVENTURE: [
        1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
        2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
      ],
      ASX: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
        2022, 2023, 2024, 2025,
      ],
      ECLIPSE: [2010, 2011, 2012],
      "EK X": [2019, 2020],
      EVOLUTION: [2014, 2015],
      GALANT: [2010, 2011, 2012, 2014],
      LANCER: [2012, 2013, 2014, 2015, 2016, 2017],
      MIRAGE: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      "MIRAGE G4": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      MONTERO: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      STRADA: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      XPANDER: [2017, 2018, 2019],
    },
  },
  {
    make: "NISSAN",
    models: {
      ALMERA: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      "GRAND LIVINA": [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
      ],
      NAVARA: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      PATROL: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      SENTRA: [
        2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018, 2019, 2020,
      ],
      "X-TERRA": [2010, 2011, 2012, 2013, 2014, 2015],
    },
  },
  {
    make: "TOYOTA",
    models: {
      ATLIS: [2009, 2010, 2011, 2012, 2013, 2014],
      AVANZA: [
        2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
        2023, 2024, 2025,
      ],
      CAMRY: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
      ],
      COROLLA: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      "FJ CRUISER": [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
      ],
      HILUX: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
      "LITE ACE": [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      RAV4: [2015, 2016, 2017, 2018, 2019, 2020],
      RUSH: [2015, 2016, 2017, 2018, 2019, 2020, 2021],
      VIOS: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
      ],
      WIGO: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      YARIS: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
    },
  },
];

export const SEARCH_BY_SIZE: SearchBySize = {
  155: {
    30: [13],
  },
  165: {
    35: [14],
  },
  175: {
    40: [15],
  },
  185: {
    45: [16],
  },
  195: {
    50: [17],
  },
  205: {
    55: [18],
  },
  215: {
    60: [19],
  },
  217: {
    65: [20],
  },
  225: {
    70: [],
  },
  235: {
    75: [],
  },
  245: {
    80: [],
  },
  255: {
    85: [],
  },
  260: {
    90: [],
  },
  265: {},
  275: {},
  285: {},
  295: {},
  305: {},
  315: {},
};

export const HISTORY = `Tyre2Go is the evolution of 202 Mags and Tires, a business built
            from a passion for cars and a commitment to providing quality wheels
            and tires. What began three years ago as a small online marketplace
            post quickly gained the trust of customers through reliable
            products, affordable prices, and excellent service. <br /> <br /> From those humble beginnings, Tyre2Go grew from online selling to
            opening a physical store, serving more car owners with the same
            dedication and personal touch. Today, Tyre2Go continues to be a
            trusted name in the community, driven by the belief that every car
            owner deserves access to dependable, affordable, and stylish wheels
            and tires.`;

export const MISSION = `Our mission at Tyre2Go is to empower every car owner with access
                to dependable, high-quality, and stylish wheels and tires at
                prices that remain within reach. We are committed not only to
                providing products that ensure safety and performance but also
                to creating a customer experience built on trust, care, and
                expertise.`;

export const VISION = `Our vision is to establish Tyre2Go as the leading tire and wheel
                provider in the Philippines, recognized for our unwavering
                dedication to quality, value, and customer satisfaction. We
                aspire to expand beyond being just a store, evolving into a
                trusted partner for every driver—from daily commuters to car
                enthusiasts.`;

export const CORE_VALUES = [
  {
    title: "Quality First",
    description:
      "We deliver only wheels and tires we would trust for our own vehicles, ensuring safety and durability on every ride.",
    icon: ShieldCheck,
  },
  {
    title: "Customer-Centered",
    description:
      "Every decision starts with the needs of our customers. We listen, guide, and provide solutions that truly fit.",
    icon: Users,
  },
  {
    title: "Integrity",
    description:
      "We believe in honesty, transparency, and fair pricing—building trust through every interaction and transaction.",
    icon: BadgeCheck,
  },
  {
    title: "Passion for Cars",
    description:
      "Our love for cars drives us to continuously improve, innovate, and share our expertise with every car owner.",
    icon: Car,
  },
  {
    title: "Community Trust",
    description:
      "We grow alongside our community by creating strong relationships built on respect, reliability, and service.",
    icon: Handshake,
  },
];

export const TEAM = [
  {
    id: 1,
    name: "Dela Cruz, Kariya Shien C.",
    designation: "UI/UX Designer",
    image: "/team/kariya.jpg",
    facebook: "https://www.facebook.com/kariyashien.delacruz#",
  },
  {
    id: 2,
    name: "Fria, Adrian Raynard G.",
    designation: "System Analyst",
    image: "/team/adrian.jpg",
    facebook: "https://www.facebook.com/adrianraynardfria#",
  },
  {
    id: 3,
    name: "Junsay, Rica Yvonne D.",
    designation: "Document Specialist",
    image: "/team/rica.jpg",
    facebook: "https://www.facebook.com/yveesure#",
  },
  {
    id: 4,
    name: "Lingal, Jeffree Allen D.",
    designation: "Software Engineer",
    image: "/team/jeff.jpg",
    facebook: "https://www.facebook.com/jeffreelingal#",
  },
  {
    id: 5,
    name: "Obalan, Francine R.",
    designation: "Project Manager",
    image: "/team/francine.jpg",
    facebook: "https://www.facebook.com/frawnseen#",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Tyre2Go made upgrading my car’s mags and tires so easy! The quality is top-notch and the prices are better than anywhere else I checked.",
    name: "Sarah Chen",
    designation: "Car Enthusiast",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote:
      "The team at Tyre2Go guided me in choosing the right tire size for my SUV. Fast service, affordable rates, and excellent customer support!",
    name: "Michael Rodriguez",
    designation: "SUV Owner",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote:
      "I was worried about finding genuine mags online, but Tyre2Go delivered exactly what was promised. My ride looks and feels brand new.",
    name: "Emily Watson",
    designation: "Satisfied Customer",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote:
      "Smooth transaction and quick delivery. Tyre2Go’s wide selection of tires made it easy to get the perfect fit for my sedan.",
    name: "James Kim",
    designation: "Daily Driver",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop",
  },
  {
    quote:
      "Tyre2Go is my go-to for all my tire needs. Reliable, affordable, and customer service that truly cares. Highly recommended!",
    name: "Lisa Thompson",
    designation: "Long-time Customer",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
  },
];

export const TIPS_CATEGORY = [
  {
    label: "Tire Basics",
    value: "Tire Basics",
    slug: "tire-basics",
    image: "https://images.pexels.com/photos/8986175/pexels-photo-8986175.jpeg",
  },
  {
    label: "Car & Tire Maintenance",
    value: "Car & Tire Maintenance",
    slug: "car-tire-maintenance",
    image: "https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg",
  },
  {
    label: "Tire Safety",
    value: "Tire Safety",
    slug: "tire-safety",
    image: "https://images.pexels.com/photos/5834960/pexels-photo-5834960.jpeg",
  },
  {
    label: "Driving Tips",
    value: "Driving Tips",
    slug: "driving-tips",
    image: "https://images.pexels.com/photos/1386649/pexels-photo-1386649.jpeg",
  },
  {
    label: "Tire Buying",
    value: "Tire Buying",
    slug: "tire-buying",
    image: "https://images.pexels.com/photos/3806252/pexels-photo-3806252.jpeg",
  },
];
