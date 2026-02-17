import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Authentication is handled client-side by Logto SDK.
 * Proxy is kept minimal as a passthrough.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
