import "server-only";

import { inviteRepository } from "@/lib/repositories/invite-repository";
import { recordAudit } from "@/lib/services/audit-service";
import { loadClient } from "@/lib/services/client-service";
import type {
  ClientInvite,
  ClientInviteStatus,
  SessionUser,
  SupportedNetwork,
} from "@/lib/types";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const ALG = { name: "HMAC", hash: "SHA-256" } as const;

function utf8(s: string) {
  return new TextEncoder().encode(s);
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  const base64 = Buffer.from(bin, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const node = Buffer.from(base64, "base64");
  const out = new ArrayBuffer(node.byteLength);
  new Uint8Array(out).set(node);
  return out;
}

function getInviteSecret(): string {
  return (
    process.env.INVITE_TOKEN_SECRET ??
    process.env.SESSION_SECRET ??
    "lci-dev-invite-secret-please-rotate"
  );
}

export async function signInviteId(id: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(getInviteSecret()),
    ALG,
    false,
    ["sign", "verify"],
  );
  const payloadB64 = base64UrlEncode(utf8(JSON.stringify({ id })));
  const sig = await crypto.subtle.sign(ALG, key, utf8(payloadB64));
  return `${payloadB64}.${base64UrlEncode(sig)}`;
}

async function verifyInviteToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      utf8(getInviteSecret()),
      ALG,
      false,
      ["sign", "verify"],
    );
    const ok = await crypto.subtle.verify(
      ALG,
      key,
      base64UrlDecode(sigB64),
      utf8(payloadB64),
    );
    if (!ok) return null;
    const { id } = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64)),
    );
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

export interface CreateInviteInput {
  clientId: string;
  email?: string | null;
  contactName?: string | null;
  allowedNetworks?: SupportedNetwork[];
  ttlMs?: number;
}

export interface CreatedInvite {
  invite: ClientInvite;
  token: string;
  /** Public URL the client should open. */
  url: string;
}

export async function createInvite(
  input: CreateInviteInput,
  actor: SessionUser,
): Promise<CreatedInvite> {
  const client = await loadClient(input.clientId);
  if (!client) {
    throw new Error(`Unknown client: ${input.clientId}`);
  }
  const now = new Date();
  const id = `inv_${Math.random().toString(36).slice(2, 12)}`;
  const invite: ClientInvite = {
    id,
    clientId: input.clientId,
    email: input.email ?? null,
    contactName: input.contactName ?? null,
    allowedNetworks: input.allowedNetworks?.length
      ? input.allowedNetworks
      : ["facebook", "instagram"],
    status: "pending",
    expiresAt: new Date(now.getTime() + (input.ttlMs ?? TWO_WEEKS_MS)).toISOString(),
    createdAt: now.toISOString(),
    createdBy: actor.uid,
    usedAt: null,
    openedAt: null,
  };

  await inviteRepository.create(invite);
  const token = await signInviteId(id);
  const url = `${getAppBaseUrl()}/connect/${token}`;

  await recordAudit({
    type: "invite.created",
    message: `Invite for ${client.name} created by ${actor.email}.`,
    actorUid: actor.uid,
    clientId: input.clientId,
    meta: { inviteId: id, allowedNetworks: invite.allowedNetworks },
  });

  return { invite, token, url };
}

export interface ResolvedInvite {
  invite: ClientInvite;
  status: "valid" | "expired" | "used" | "revoked" | "invalid";
  token: string;
}

export async function resolveInviteToken(token: string): Promise<ResolvedInvite | null> {
  const id = await verifyInviteToken(token);
  if (!id) return null;
  const invite = await inviteRepository.get(id);
  if (!invite) return null;

  let status: ResolvedInvite["status"];
  if (invite.status === "used") status = "used";
  else if (invite.status === "revoked") status = "revoked";
  else if (new Date(invite.expiresAt).getTime() < Date.now()) status = "expired";
  else status = "valid";

  return { invite, status, token };
}

export async function markInviteOpened(inviteId: string): Promise<void> {
  // Best-effort. Reads + writes here are pure side effects (audit + opened
  // timestamp) and must never crash the public review/connect page render.
  try {
    const invite = await inviteRepository.get(inviteId);
    if (!invite || invite.openedAt) return;
    await inviteRepository.update(inviteId, {
      openedAt: new Date().toISOString(),
      status: invite.status === "pending" ? "opened" : invite.status,
    });
    await recordAudit({
      type: "invite.opened",
      message: `Invite ${inviteId} opened by client.`,
      clientId: invite.clientId,
      meta: { inviteId },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[invites] markInviteOpened(${inviteId}) failed:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export async function markInviteStatus(
  inviteId: string,
  status: ClientInviteStatus,
): Promise<void> {
  const invite = await inviteRepository.get(inviteId);
  if (!invite) return;
  const patch: Partial<ClientInvite> = { status };
  if (status === "used") patch.usedAt = new Date().toISOString();
  await inviteRepository.update(inviteId, patch);
}

export async function listInvites(clientId?: string) {
  return inviteRepository.list(clientId);
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
