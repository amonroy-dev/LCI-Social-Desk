import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AgencyRole, SessionUser } from "@/lib/types";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function getCurrentSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireSession(
  options: { redirectTo?: string; minRole?: AgencyRole } = {},
): Promise<SessionUser> {
  const session = await getCurrentSession();
  if (!session) {
    const target = options.redirectTo ?? "/sign-in";
    redirect(target);
  }
  if (options.minRole) {
    const { hasAtLeast } = await import("./roles");
    if (!hasAtLeast(session.role, options.minRole)) {
      redirect("/sign-in?reason=forbidden");
    }
  }
  return session;
}
