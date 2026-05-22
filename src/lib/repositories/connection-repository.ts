import type { SocialConnection, SupportedNetwork } from "@/lib/types";

const connections = new Map<string, SocialConnection>();

function keyFor(clientId: string, platform: SupportedNetwork) {
  return `${clientId}::${platform}`;
}

export const connectionRepository = {
  async get(
    clientId: string,
    platform: SupportedNetwork,
  ): Promise<SocialConnection | null> {
    return connections.get(keyFor(clientId, platform)) ?? null;
  },
  async listForClient(clientId: string): Promise<SocialConnection[]> {
    return Array.from(connections.values()).filter(
      (c) => c.clientId === clientId,
    );
  },
  async upsert(
    connection: SocialConnection,
  ): Promise<SocialConnection> {
    connections.set(keyFor(connection.clientId, connection.platform), connection);
    return connection;
  },
  async patch(
    clientId: string,
    platform: SupportedNetwork,
    patch: Partial<SocialConnection>,
  ): Promise<SocialConnection | null> {
    const existing = await this.get(clientId, platform);
    if (!existing) return null;
    const next: SocialConnection = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    connections.set(keyFor(clientId, platform), next);
    return next;
  },
};
