import type { ClientInvite } from "@/lib/types";

/**
 * In-memory invite store. Swap for Firestore `clientInvites` later by
 * implementing the same interface against a real driver.
 */

const invites = new Map<string, ClientInvite>();

export const inviteRepository = {
  async create(invite: ClientInvite): Promise<ClientInvite> {
    invites.set(invite.id, invite);
    return invite;
  },
  async get(id: string): Promise<ClientInvite | null> {
    return invites.get(id) ?? null;
  },
  async list(clientId?: string): Promise<ClientInvite[]> {
    const all = Array.from(invites.values()).sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    );
    return clientId ? all.filter((i) => i.clientId === clientId) : all;
  },
  async update(
    id: string,
    patch: Partial<ClientInvite>,
  ): Promise<ClientInvite | null> {
    const existing = invites.get(id);
    if (!existing) return null;
    const next: ClientInvite = { ...existing, ...patch };
    invites.set(id, next);
    return next;
  },
};
