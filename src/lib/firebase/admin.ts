import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

import { readAdminConfig } from "./config";

let cachedApp: App | null = null;

function ensureApp(): App | null {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApp();
    return cachedApp;
  }
  const cfg = readAdminConfig();
  if (!cfg) return null;
  cachedApp = initializeApp({
    credential: cert({
      projectId: cfg.projectId,
      clientEmail: cfg.clientEmail,
      privateKey: cfg.privateKey,
    }),
    projectId: cfg.projectId,
  });
  return cachedApp;
}

export function getAdminAuth(): Auth | null {
  const app = ensureApp();
  return app ? getAuth(app) : null;
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
  const auth = getAdminAuth();
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
