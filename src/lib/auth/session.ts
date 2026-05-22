import type { AgencyRole, SessionUser } from "@/lib/types";

/**
 * Session cookie:
 *
 *   <base64url(payload)>.<base64url(hmac-sha256(payload))>
 *
 * `payload` is a JSON object: { uid, email, name, role, demo, iat, exp }.
 * The cookie is signed with SESSION_SECRET so middleware can validate it on the
 * Edge runtime using Web Crypto — no firebase-admin required there.
 */

export const SESSION_COOKIE = "__lci_session";
const ALG = { name: "HMAC", hash: "SHA-256" } as const;

const TWELVE_HOURS_SECONDS = 60 * 60 * 12;

function utf8(s: string) {
  return new TextEncoder().encode(s);
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr =
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  const base64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bin, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin =
    typeof atob === "function"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

function getSecret(): string {
  const secret =
    process.env.SESSION_SECRET ??
    // Stable but visibly weak default — never use in production. Surfaced in
    // /sign-in and README so operators set SESSION_SECRET in their env.
    "lci-dev-session-secret-please-rotate";
  return secret;
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    utf8(secret),
    ALG,
    false,
    ["sign", "verify"],
  );
}

interface RawPayload extends SessionUser {
  iat: number;
  exp: number;
}

export interface IssueSessionInput {
  uid: string;
  email: string;
  name: string;
  role: AgencyRole;
  demo?: boolean;
  /** Optional override for cookie lifetime in seconds. */
  ttlSeconds?: number;
}

export async function issueSessionToken(
  input: IssueSessionInput,
): Promise<{ token: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (input.ttlSeconds ?? TWELVE_HOURS_SECONDS);
  const payload: RawPayload = {
    uid: input.uid,
    email: input.email,
    name: input.name,
    role: input.role,
    demo: input.demo,
    iat: now,
    exp,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(utf8(payloadJson));
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign(ALG, key, utf8(payloadB64));
  const sigB64 = base64UrlEncode(sig);
  return {
    token: `${payloadB64}.${sigB64}`,
    expiresAt: new Date(exp * 1000),
  };
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await importKey(getSecret());
    const ok = await crypto.subtle.verify(
      ALG,
      key,
      base64UrlDecode(sigB64),
      utf8(payloadB64),
    );
    if (!ok) return null;
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(json) as RawPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return {
      uid: payload.uid,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      demo: payload.demo,
    };
  } catch {
    return null;
  }
}
