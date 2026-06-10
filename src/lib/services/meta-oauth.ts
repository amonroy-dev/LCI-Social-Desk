import "server-only";

import type { SupportedNetwork } from "@/lib/types";

/**
 * Meta (Facebook + Instagram) OAuth helpers.
 *
 * Both Facebook Pages and Instagram Business / Professional accounts are
 * connected through a single Meta authorization. The agency requests the
 * Page and IG scopes together; on callback we record one socialConnection
 * per requested network.
 *
 * When META_APP_ID / META_APP_SECRET are absent the route handlers fall back
 * to a clearly-marked simulated exchange so the end-to-end flow still works
 * for product demos and local dev.
 */

export const META_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";
export const META_TOKEN_URL =
  "https://graph.facebook.com/v19.0/oauth/access_token";

export const DEFAULT_META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
];

export interface MetaConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}

export function readMetaConfig(): MetaConfig | null {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return null;
  const redirectUri =
    process.env.META_REDIRECT_URI ??
    `${getAppBaseUrl()}/api/oauth/meta/callback`;
  const scopes =
    process.env.META_SCOPES?.split(",").map((s) => s.trim()).filter(Boolean) ??
    DEFAULT_META_SCOPES;
  return { appId, appSecret, redirectUri, scopes };
}

export function isMetaConfigured(): boolean {
  return readMetaConfig() !== null;
}

export interface BuildAuthUrlInput {
  state: string;
  config: MetaConfig;
}

export function buildMetaAuthUrl({ state, config }: BuildAuthUrlInput): string {
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state,
    scope: config.scopes.join(","),
  });
  return `${META_AUTH_URL}?${params.toString()}`;
}

export interface MetaExchangeResult {
  accessToken: string;
  expiresInSeconds: number | null;
  accounts: Array<{
    platform: SupportedNetwork;
    accountId: string;
    accountName: string;
    /** Page-level access token (used for publishing, not user token). */
    accessToken: string;
  }>;
  simulated: boolean;
}

export async function exchangeCodeForTokens(
  code: string,
  clientName: string,
): Promise<MetaExchangeResult> {
  const config = readMetaConfig();
  if (!config) {
    return simulatedExchange(clientName);
  }

  try {
    const tokenRes = await fetch(
      `${META_TOKEN_URL}?` +
        new URLSearchParams({
          client_id: config.appId,
          client_secret: config.appSecret,
          redirect_uri: config.redirectUri,
          code,
        }).toString(),
      { method: "GET" },
    );

    if (!tokenRes.ok) {
      throw new Error(`Meta token exchange failed: ${tokenRes.status}`);
    }

    const tokenJson = (await tokenRes.json()) as {
      access_token: string;
      token_type?: string;
      expires_in?: number;
    };

    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(tokenJson.access_token)}`,
    );
    const pagesJson = (await pagesRes.json().catch(() => ({}))) as {
      data?: Array<{
        id: string;
        name: string;
        access_token?: string;
        instagram_business_account?: { id: string };
      }>;
    };

    const accounts: MetaExchangeResult["accounts"] = [];
    const firstPage = pagesJson.data?.[0];
    if (firstPage) {
      const pageToken = firstPage.access_token ?? tokenJson.access_token;
      accounts.push({
        platform: "facebook",
        accountId: firstPage.id,
        accountName: firstPage.name,
        accessToken: pageToken,
      });
      if (firstPage.instagram_business_account) {
        accounts.push({
          platform: "instagram",
          accountId: firstPage.instagram_business_account.id,
          accountName: `${firstPage.name} · Instagram`,
          accessToken: pageToken,
        });
      }
    }

    return {
      accessToken: tokenJson.access_token,
      expiresInSeconds: tokenJson.expires_in ?? null,
      accounts,
      simulated: false,
    };
  } catch {
    return simulatedExchange(clientName);
  }
}

function simulatedExchange(clientName: string): MetaExchangeResult {
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const simToken = `simulated_${Math.random().toString(36).slice(2)}`;
  return {
    accessToken: simToken,
    expiresInSeconds: 60 * 60 * 24 * 60,
    accounts: [
      {
        platform: "facebook",
        accountId: `fb_${slug}`,
        accountName: `${clientName} (Facebook Page)`,
        accessToken: simToken,
      },
      {
        platform: "instagram",
        accountId: `ig_${slug}`,
        accountName: `${clientName} (Instagram Business)`,
        accessToken: simToken,
      },
    ],
    simulated: true,
  };
}

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Signed OAuth `state` parameter so we can verify on callback that the request
 * came from our /api/oauth/meta/start handoff.
 */
const STATE_ALG = { name: "HMAC", hash: "SHA-256" } as const;

function utf8(s: string) {
  return new TextEncoder().encode(s);
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return Buffer.from(bin, "binary")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const node = Buffer.from(base64, "base64");
  const out = new ArrayBuffer(node.byteLength);
  new Uint8Array(out).set(node);
  return out;
}

function getStateSecret(): string {
  return (
    process.env.META_STATE_SECRET ??
    process.env.SESSION_SECRET ??
    "lci-dev-meta-state-secret"
  );
}

export interface OAuthStatePayload {
  inviteId: string;
  clientId: string;
  ts: number;
  nonce: string;
}

export async function signOAuthState(payload: Omit<OAuthStatePayload, "ts" | "nonce">): Promise<string> {
  const filled: OAuthStatePayload = {
    ...payload,
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2, 14),
  };
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(getStateSecret()),
    STATE_ALG,
    false,
    ["sign", "verify"],
  );
  const json = JSON.stringify(filled);
  const payloadB64 = base64UrlEncode(utf8(json));
  const sig = await crypto.subtle.sign(STATE_ALG, key, utf8(payloadB64));
  return `${payloadB64}.${base64UrlEncode(sig)}`;
}

export async function verifyOAuthState(
  state: string,
  maxAgeMs = 15 * 60 * 1000,
): Promise<OAuthStatePayload | null> {
  const parts = state.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      utf8(getStateSecret()),
      STATE_ALG,
      false,
      ["sign", "verify"],
    );
    const ok = await crypto.subtle.verify(
      STATE_ALG,
      key,
      base64UrlDecode(sigB64),
      utf8(payloadB64),
    );
    if (!ok) return null;
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(json) as OAuthStatePayload;
    if (Date.now() - payload.ts > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}
