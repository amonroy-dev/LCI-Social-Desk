import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Middleware gates the dashboard. It verifies the HMAC session cookie on the
 * Edge runtime using Web Crypto — no firebase-admin dependency here.
 *
 * Cookie issuance (which involves verifying Firebase ID tokens) happens in
 * /api/auth/session, which runs on the Node runtime.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname + (search ?? ""));
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-lci-user-uid", session.uid);
  response.headers.set("x-lci-user-role", session.role);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
