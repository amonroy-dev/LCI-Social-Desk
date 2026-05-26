import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { readAdminConfig } from "./config";

let cachedApp: App | null = null;

let initFailed = false;

function ensureApp(): App | null {
  if (cachedApp) return cachedApp;
  if (initFailed) return null;
  if (getApps().length) {
    cachedApp = getApp();
    return cachedApp;
  }
  const cfg = readAdminConfig();
  if (!cfg) return null;
  try {
    cachedApp = initializeApp({
      credential: cert({
        projectId: cfg.projectId,
        clientEmail: cfg.clientEmail,
        privateKey: cfg.privateKey,
      }),
      projectId: cfg.projectId,
    });
  } catch (err) {
    initFailed = true;
    // eslint-disable-next-line no-console
    console.error("[firebase-admin] Failed to initialize:", err instanceof Error ? err.message : err);
    return null;
  }
  return cachedApp;
}

export function getAdminAuth(): Auth | null {
  const app = ensureApp();
  return app ? getAuth(app) : null;
}

let cachedFirestore: Firestore | null = null;

export function getAdminFirestore(): Firestore | null {
  if (cachedFirestore) return cachedFirestore;
  const app = ensureApp();
  if (!app) return null;
  cachedFirestore = getFirestore(app);
  try {
    // Ignore properties not registered in TypeScript types — Firestore safely
    // ignores already-initialized settings on subsequent calls.
    cachedFirestore.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() can only be called once per Firestore instance. After the
    // first call all subsequent ones throw — which is fine here.
  }
  return cachedFirestore;
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  picture?: string | null;
}

/**
 * Verifies a Firebase ID token and returns a normalized user record. Returns
 * null when firebase-admin is not configured or verification fails.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedFirebaseUser | null> {
  let auth: Auth | null;
  try {
    auth = getAdminAuth();
  } catch {
    return null;
  }
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    if (!decoded.email) return null;
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified ?? false,
      name: (decoded.name as string | undefined) ?? decoded.email,
      picture: (decoded.picture as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}
