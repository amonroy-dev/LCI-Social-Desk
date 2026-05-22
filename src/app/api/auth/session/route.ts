import { NextResponse, type NextRequest } from "next/server";

import { recordAudit } from "@/lib/services/audit-service";
import { issueSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { resolveRoleForEmail } from "@/lib/auth/roles";
import { resolveRoleForVerifiedUser } from "@/lib/services/agency-member-service";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import {
  isDemoModeEnabled,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/config";

export const runtime = "nodejs";

interface SignInBody {
  /** Firebase ID token. Required when not using demo mode. */
  idToken?: string;
  /** When set and demo mode is enabled, accepts a self-described user. */
  demo?: {
    email: string;
    name?: string;
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as SignInBody;

  if (body.idToken) {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
        },
        { status: 503 },
      );
    }
    const user = await verifyFirebaseIdToken(body.idToken);
    if (!user) {
      return NextResponse.json(
        { error: "ID token could not be verified." },
        { status: 401 },
      );
    }

    let role;
    try {
      role = await resolveRoleForVerifiedUser({
        uid: user.uid,
        email: user.email,
        fullName: user.name,
        avatarUrl: user.picture ?? null,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "agencyMembers lookup failed.";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const { token, expiresAt } = await issueSessionToken({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role,
    });

    await recordAudit({
      type: "auth.signed_in",
      message: `${user.email} signed in via Firebase.`,
      actorUid: user.uid,
      meta: { provider: "firebase", role },
    });

    return setCookieResponse(token, expiresAt);
  }

  if (body.demo && isDemoModeEnabled()) {
    const email = body.demo.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Provide a valid demo email." },
        { status: 400 },
      );
    }
    const role = resolveRoleForEmail(email) || "owner";
    const uid = `demo_${Buffer.from(email).toString("hex").slice(0, 24)}`;
    const name = body.demo.name?.trim() || email.split("@")[0];
    const { token, expiresAt } = await issueSessionToken({
      uid,
      email,
      name,
      role,
      demo: true,
    });

    await recordAudit({
      type: "auth.signed_in",
      message: `${email} entered demo session.`,
      actorUid: uid,
      meta: { provider: "demo", role },
    });

    return setCookieResponse(token, expiresAt);
  }

  return NextResponse.json(
    { error: "Missing idToken or demo payload." },
    { status: 400 },
  );
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  await recordAudit({
    type: "auth.signed_out",
    message: "Session terminated.",
  });
  return response;
}

function setCookieResponse(token: string, expiresAt: Date) {
  const response = NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
