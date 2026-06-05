import type { Client, ContentTag, NetworkId } from "./types";

/**
 * Networks shown in the composer. LinkedIn is intentionally hidden in this
 * phase — the placeholder remains in the type union so existing previews
 * keep compiling, but the network is not surfaced as a toggle.
 */
export const NETWORKS: { id: NetworkId; label: string }[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

export const CONTENT_TAGS: ContentTag[] = [
  "Promo",
  "Educational",
  "Client Update",
  "Seasonal",
  "Urgent",
];

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: "northshore-dental",
    name: "Northshore Dental",
    shortCode: "ND",
    industry: "Healthcare",
    accent: "bg-teal-100 text-teal-700",
  },
  {
    id: "alta-legal-group",
    name: "Alta Legal Group",
    shortCode: "AL",
    industry: "Legal",
    accent: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "west-pine-realty",
    name: "West & Pine Realty",
    shortCode: "WP",
    industry: "Real Estate",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    id: "harbor-wellness",
    name: "Harbor Wellness Co.",
    shortCode: "HW",
    industry: "Wellness",
    accent: "bg-emerald-100 text-emerald-700",
  },
];

export function getClient(clientId: string): Client | undefined {
  return SAMPLE_CLIENTS.find((c) => c.id === clientId);
}

/**
 * Palette used by the Add Client dialog. Each entry pairs the Tailwind
 * classes applied to the ClientChip (accent) with a swatch class for the
 * picker preview. Adding entries here automatically extends the palette.
 */
export const CLIENT_ACCENT_PALETTE = [
  { value: "bg-teal-100 text-teal-700", swatch: "bg-teal-500", label: "Teal" },
  { value: "bg-indigo-100 text-indigo-700", swatch: "bg-indigo-500", label: "Indigo" },
  { value: "bg-amber-100 text-amber-700", swatch: "bg-amber-500", label: "Amber" },
  { value: "bg-emerald-100 text-emerald-700", swatch: "bg-emerald-500", label: "Emerald" },
  { value: "bg-rose-100 text-rose-700", swatch: "bg-rose-500", label: "Rose" },
  { value: "bg-violet-100 text-violet-700", swatch: "bg-violet-500", label: "Violet" },
  { value: "bg-sky-100 text-sky-700", swatch: "bg-sky-500", label: "Sky" },
  { value: "bg-orange-100 text-orange-700", swatch: "bg-orange-500", label: "Orange" },
] as const;

export type ClientAccentValue = (typeof CLIENT_ACCENT_PALETTE)[number]["value"];

/** Slugify a client name into an id-safe string. */
export function slugifyClientName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Build a 2–3 letter short code from a name (e.g. "Northshore Dental" -> "ND"). */
export function deriveShortCode(name: string): string {
  const words = name
    .replace(/&/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);
  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Pick a deterministic accent for a name so the same client always gets
 * the same color even when added on different machines. Used as the
 * default selection in the Add Client dialog.
 */
export function suggestAccent(name: string): ClientAccentValue {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % CLIENT_ACCENT_PALETTE.length;
  return CLIENT_ACCENT_PALETTE[idx].value;
}
