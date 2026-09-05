export interface BodyColors {
  hi: string;
  base: string;
  lo: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  kind: string;
  colors: BodyColors;
  diameterKm: number;
  distanceMkm: number; // 0 for the Sun
  distanceAU: number;
  periodDays: number; // orbital period (rotation for the Sun)
  dayLength: string;
  moons: string;
  temp: string;
  fact: string;
  atmosphere?: string;
  ring?: "saturn" | "uranus";
  bands?: boolean;
  hasMoon?: boolean;
  // computed layout
  orbitR: number;
  visR: number;
  startAngle: number;
}

const AU = [0.387, 0.723, 1.0, 1.524, 5.203, 9.537, 19.191, 30.069];

// compressed radial scale: r = MIN + ((AU^0.45 - lo) / (hi - lo)) * SPAN
const ORBIT_MIN = 102;
const ORBIT_SPAN = 372;
const POW = 0.45;
const LO = Math.pow(AU[0], POW);
const HI = Math.pow(AU[7], POW);

export const orbitRadius = (au: number) =>
  ORBIT_MIN + ((Math.pow(au, POW) - LO) / (HI - LO)) * ORBIT_SPAN;

/** normalized 0..1 position along the compressed scale (for the distance track) */
export const orbitFrac = (au: number) => (Math.pow(au, POW) - LO) / (HI - LO);

export const visualRadius = (diameterKm: number) =>
  Math.max(4.6, Math.sqrt(diameterKm) / 14.4);

const GOLDEN = 2.39996;

interface Raw {
  id: string;
  name: string;
  kind: string;
  colors: BodyColors;
  diameterKm: number;
  distanceMkm: number;
  periodDays: number;
  dayLength: string;
  moons: string;
  temp: string;
  fact: string;
  atmosphere?: string;
  ring?: "saturn" | "uranus";
  bands?: boolean;
  hasMoon?: boolean;
}

const RAW: Raw[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "Rocky world",
    colors: { hi: "#d9cbb8", base: "#a89684", lo: "#5f5347" },
    diameterKm: 4879,
    distanceMkm: 57.9,
    periodDays: 88,
    dayLength: "58.6 Earth days",
    moons: "0",
    temp: "167 °C mean",
    fact: "A year on Mercury lasts just 88 days — yet one full solar day, sunrise to sunrise, takes 176 Earth days.",
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Rocky world",
    colors: { hi: "#f7e3b0", base: "#e0b877", lo: "#8a6134" },
    diameterKm: 12104,
    distanceMkm: 108.2,
    periodDays: 224.7,
    dayLength: "243 Earth days",
    moons: "0",
    temp: "464 °C",
    fact: "Venus spins backwards, so its Sun rises in the west — and its runaway greenhouse makes it hotter than Mercury.",
    atmosphere: "rgba(247, 227, 176, 0.28)",
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Rocky world",
    colors: { hi: "#9fd8ff", base: "#3f8fe8", lo: "#122f73" },
    diameterKm: 12742,
    distanceMkm: 149.6,
    periodDays: 365.25,
    dayLength: "23.9 hours",
    moons: "1",
    temp: "15 °C",
    fact: "The only world known to host life — and the only planet in the solar system not named after a deity.",
    atmosphere: "rgba(124, 196, 255, 0.35)",
    hasMoon: true,
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Rocky world",
    colors: { hi: "#ffb387", base: "#dd6b45", lo: "#7c2f18" },
    diameterKm: 6779,
    distanceMkm: 227.9,
    periodDays: 687,
    dayLength: "24.6 hours",
    moons: "2",
    temp: "−63 °C",
    fact: "Mars hosts Olympus Mons, a volcano three times the height of Everest — the tallest known in the solar system.",
    atmosphere: "rgba(255, 154, 110, 0.14)",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    colors: { hi: "#f6dcae", base: "#d9a066", lo: "#7a4a26" },
    diameterKm: 139820,
    distanceMkm: 778.5,
    periodDays: 4333,
    dayLength: "9.9 hours",
    moons: "95",
    temp: "−108 °C",
    fact: "The Great Red Spot is a storm wider than Earth that has been raging for at least 190 years — possibly centuries more.",
    bands: true,
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    colors: { hi: "#f8e7bd", base: "#e3c584", lo: "#8a6c3a" },
    diameterKm: 116460,
    distanceMkm: 1434,
    periodDays: 10759,
    dayLength: "10.7 hours",
    moons: "146",
    temp: "−139 °C",
    fact: "Saturn is so light for its size that it would float — its mean density is lower than water's.",
    ring: "saturn",
    bands: true,
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    colors: { hi: "#d4f4f4", base: "#8fd5d8", lo: "#3d7580" },
    diameterKm: 50724,
    distanceMkm: 2871,
    periodDays: 30687,
    dayLength: "17.2 hours",
    moons: "28",
    temp: "−197 °C",
    fact: "Uranus rolls around the Sun on its side — its axis is tilted 98 degrees, likely knocked over by an ancient impact.",
    ring: "uranus",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    colors: { hi: "#93b4ff", base: "#4f74e8", lo: "#1c2f86" },
    diameterKm: 49244,
    distanceMkm: 4495,
    periodDays: 60190,
    dayLength: "16.1 hours",
    moons: "16",
    temp: "−201 °C",
    fact: "Neptune's winds exceed 2,000 km/h — the fastest measured anywhere in the solar system.",
    atmosphere: "rgba(120, 150, 255, 0.2)",
  },
];

export const PLANETS: CelestialBody[] = RAW.map((r, i) => ({
  ...r,
  distanceAU: AU[i],
  orbitR: orbitRadius(AU[i]),
  visR: visualRadius(r.diameterKm),
  startAngle: i * GOLDEN + 0.7,
}));

export const SUN: CelestialBody = {
  id: "sun",
  name: "The Sun",
  kind: "G-type main-sequence star",
  colors: { hi: "#fff9e3", base: "#f2b544", lo: "#f98b2b" },
  diameterKm: 1392700,
  distanceMkm: 0,
  distanceAU: 0,
  periodDays: 0,
  dayLength: "27 Earth days (rotation)",
  moons: "8 planets",
  temp: "5,505 °C surface",
  fact: "The Sun holds 99.86% of all mass in the solar system. Every planet, comet and asteroid is a rounding error.",
  orbitR: 0,
  visR: 46,
  startAngle: 0,
};

export const fmtKm = (n: number) => Math.round(n).toLocaleString("en-US");

export const periodLabel = (days: number) => {
  if (days < 1000) return `${Math.round(days)} days`;
  return `${(days / 365.25).toFixed(1)} years`;
};

export const speedToSlider = (speed: number) =>
  Math.round((1000 * Math.log(speed / 0.1)) / Math.log(200));

export const sliderToSpeed = (v: number) => 0.1 * Math.pow(200, v / 1000);

export const speedLabel = (s: number) =>
  s >= 10 ? `×${Math.round(s)}` : s >= 1 ? `×${s.toFixed(1)}` : `×${s.toFixed(2)}`;
