import type { Client, ContentTag, NetworkId, SocialConnection } from "./types";

export const NETWORKS: { id: NetworkId; label: string }[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
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

export const SAMPLE_CONNECTIONS: SocialConnection[] = SAMPLE_CLIENTS.flatMap(
  (client): SocialConnection[] => [
    {
      id: `${client.id}-facebook`,
      clientId: client.id,
      network: "facebook",
      handle: `@${client.id.replace(/-/g, ".")}`,
      displayName: client.name,
      connected: true,
    },
    {
      id: `${client.id}-instagram`,
      clientId: client.id,
      network: "instagram",
      handle: `@${client.id.replace(/-/g, ".")}`,
      displayName: client.name,
      connected: true,
    },
    {
      id: `${client.id}-linkedin`,
      clientId: client.id,
      network: "linkedin",
      handle: `linkedin.com/company/${client.id}`,
      displayName: client.name,
      connected: client.id !== "harbor-wellness",
    },
  ],
);

export function getConnectionsForClient(clientId: string) {
  return SAMPLE_CONNECTIONS.filter((c) => c.clientId === clientId);
}

export function getClient(clientId: string): Client | undefined {
  return SAMPLE_CLIENTS.find((c) => c.id === clientId);
}
