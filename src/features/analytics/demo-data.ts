// Deterministic demo data for the analytics dashboard.
// Shown only when demoMode is explicitly turned on.

import type { DayPoint } from "./types";
export type { DayPoint } from "./types";

function seed(n: number) {
  return ((Math.sin(n * 127.1 + 311.7) * 43758.5453123) % 1 + 1) / 2;
}

function gen(days: number, fbBase: number, igBase: number, variance: number): DayPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    const weekdayFactor = d % 7 < 2 ? 0.75 : 1;
    const trendFactor = 1 + (i / days) * 0.15;
    const gap = d >= 21 && d <= 24 ? 0.01 : 1;
    const r1 = seed(d * 3 + 1);
    const r2 = seed(d * 7 + 2);
    return {
      day: d,
      facebook: Math.round(fbBase * weekdayFactor * trendFactor * gap * (1 + (r1 - 0.5) * variance)),
      instagram: Math.round(igBase * weekdayFactor * trendFactor * gap * (1 + (r2 - 0.5) * variance)),
    };
  });
}

export const DEMO_DAYS = 31;

export const DEMO_IMPRESSIONS = gen(DEMO_DAYS, 72_000, 14_000, 0.5);
export const DEMO_ENGAGEMENTS = gen(DEMO_DAYS, 1_400, 320, 0.6);
export const DEMO_VIDEO_VIEWS = gen(DEMO_DAYS, 105, 75, 0.65);

export const DEMO_AUDIENCE_GROWTH: DayPoint[] = Array.from({ length: DEMO_DAYS }, (_, i) => {
  const d = i + 1;
  const gap = d >= 21 && d <= 24 ? -1 : 1;
  return {
    day: d,
    facebook: Math.round((seed(d * 5 + 9) * 18 - 5) * gap),
    instagram: Math.round((seed(d * 3 + 17) * 12 - 3) * gap),
  };
});

export const DEMO_ENGAGEMENT_RATE: DayPoint[] = DEMO_IMPRESSIONS.map((imp, i) => ({
  day: i + 1,
  facebook: imp.facebook > 0 ? parseFloat(((DEMO_ENGAGEMENTS[i].facebook / imp.facebook) * 100).toFixed(2)) : 0,
  instagram: imp.instagram > 0 ? parseFloat(((DEMO_ENGAGEMENTS[i].instagram / imp.instagram) * 100).toFixed(2)) : 0,
}));

function sumField(arr: DayPoint[], field: "facebook" | "instagram") {
  return arr.reduce((acc, d) => acc + d[field], 0);
}

export const DEMO_TOTALS = {
  impressions: {
    facebook: sumField(DEMO_IMPRESSIONS, "facebook"),
    instagram: sumField(DEMO_IMPRESSIONS, "instagram"),
    get total() { return this.facebook + this.instagram; },
    facebookChange: 46.9,
    instagramChange: -49.4,
    totalChange: 13.2,
  },
  engagements: {
    facebook: sumField(DEMO_ENGAGEMENTS, "facebook"),
    instagram: sumField(DEMO_ENGAGEMENTS, "instagram"),
    get total() { return this.facebook + this.instagram; },
    facebookChange: 43.2,
    instagramChange: -2.7,
    totalChange: 40.9,
  },
  audienceGrowth: {
    facebook: sumField(DEMO_AUDIENCE_GROWTH, "facebook"),
    instagram: sumField(DEMO_AUDIENCE_GROWTH, "instagram"),
    get total() { return this.facebook + this.instagram; },
    facebookChange: -41.9,
    instagramChange: -95.8,
    totalChange: -44.4,
  },
  engagementRate: {
    facebook: parseFloat((sumField(DEMO_ENGAGEMENTS, "facebook") / sumField(DEMO_IMPRESSIONS, "facebook") * 100).toFixed(1)),
    instagram: parseFloat((sumField(DEMO_ENGAGEMENTS, "instagram") / sumField(DEMO_IMPRESSIONS, "instagram") * 100).toFixed(1)),
    get total() {
      return parseFloat(((sumField(DEMO_ENGAGEMENTS, "facebook") + sumField(DEMO_ENGAGEMENTS, "instagram")) /
        (sumField(DEMO_IMPRESSIONS, "facebook") + sumField(DEMO_IMPRESSIONS, "instagram")) * 100).toFixed(1));
    },
    facebookChange: -2.5,
    instagramChange: 92.5,
    totalChange: 24.4,
  },
  videoViews: {
    facebook: sumField(DEMO_VIDEO_VIEWS, "facebook"),
    instagram: sumField(DEMO_VIDEO_VIEWS, "instagram"),
    get total() { return this.facebook + this.instagram; },
    facebookChange: 92.8,
    instagramChange: 48.3,
    totalChange: 45.2,
  },
  postLinkClicks: {
    total: 45194,
    totalChange: 49.1,
  },
};
