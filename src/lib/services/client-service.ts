import "server-only";

import { clientRepository } from "@/lib/repositories/client-repository";
import { recordAudit } from "@/lib/services/audit-service";
import {
  CLIENT_ACCENT_PALETTE,
  deriveShortCode,
  slugifyClientName,
  suggestAccent,
  type ClientAccentValue,
} from "@/lib/sample-data";
import type { Client, SessionUser } from "@/lib/types";

/**
 * Server-side client loader + creator. Reads and writes go through
 * clientRepository, which is Firestore-first with an in-memory fallback
 * seeded by the sample roster.
 */

export async function loadClient(clientId: string): Promise<Client | null> {
  return clientRepository.get(clientId);
}

export async function loadClients(): Promise<Client[]> {
  return clientRepository.list();
}

export interface CreateClientInput {
  name: string;
  industry?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  website?: string | null;
  notes?: string | null;
  /** Optional explicit accent value from CLIENT_ACCENT_PALETTE. */
  accent?: ClientAccentValue | string | null;
}

export interface CreateClientResult {
  client: Client;
}

const VALID_ACCENT_VALUES = new Set<string>(
  CLIENT_ACCENT_PALETTE.map((p) => p.value),
);

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function generateUniqueId(name: string): Promise<string> {
  const base = slugifyClientName(name) || `client-${Date.now().toString(36)}`;
  let candidate = base;
  let n = 2;
  while (await clientRepository.exists(candidate)) {
    candidate = `${base}-${n++}`;
    if (n > 50) {
      candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      break;
    }
  }
  return candidate;
}

export async function createClient(
  input: CreateClientInput,
  actor: SessionUser,
): Promise<CreateClientResult> {
  const name = input.name.trim();
  if (!name) throw new Error("Client name is required.");
  if (name.length > 80) {
    throw new Error("Client name must be 80 characters or fewer.");
  }

  const industry = input.industry?.trim() || "";
  if (industry.length > 60) {
    throw new Error("Industry must be 60 characters or fewer.");
  }

  const primaryContactEmail = input.primaryContactEmail?.trim() || null;
  if (primaryContactEmail && !isValidEmail(primaryContactEmail)) {
    throw new Error("Primary contact email is not a valid address.");
  }

  const website = input.website?.trim() || null;
  if (website && website.length > 200) {
    throw new Error("Website URL must be 200 characters or fewer.");
  }

  const notes = input.notes?.trim() || null;
  if (notes && notes.length > 500) {
    throw new Error("Notes must be 500 characters or fewer.");
  }

  const accent =
    input.accent && VALID_ACCENT_VALUES.has(input.accent)
      ? input.accent
      : suggestAccent(name);

  const id = await generateUniqueId(name);
  const now = new Date().toISOString();

  const client: Client = {
    id,
    name,
    shortCode: deriveShortCode(name),
    industry,
    accent,
    primaryContactName: input.primaryContactName?.trim() || null,
    primaryContactEmail,
    website,
    notes,
    createdAt: now,
    createdBy: actor.uid,
    archivedAt: null,
  };

  await clientRepository.create(client);

  await recordAudit({
    type: "client.created",
    message: `Client "${client.name}" added by ${actor.email}.`,
    actorUid: actor.uid,
    clientId: client.id,
    meta: { industry: client.industry, hasContact: !!primaryContactEmail },
  });

  return { client };
}
