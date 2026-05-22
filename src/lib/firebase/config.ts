/**
 * Centralized check for which Firebase capabilities are configured. Both
 * client (browser) and server (Node) layers consult this so the rest of the
 * app can degrade gracefully into demo mode when env vars are missing.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  appId?: string;
  messagingSenderId?: string;
}

export function readClientConfig(): FirebaseClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) return null;
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
}

export function isFirebaseClientConfigured(): boolean {
  return readClientConfig() !== null;
}

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export function readAdminConfig(): FirebaseAdminConfig | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseAdminConfigured(): boolean {
  return readAdminConfig() !== null;
}

export function isDemoModeEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "demo") return true;
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "firebase") return false;
  // Default: enable demo only when Firebase isn't configured. This makes
  // local dev and bare-bones deploys usable but auto-disables in production
  // once real Firebase env vars are set.
  return !isFirebaseClientConfigured();
}
