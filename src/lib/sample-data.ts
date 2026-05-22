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
