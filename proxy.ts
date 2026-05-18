import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. The file must export
// a function named `proxy` (or default) once it exists — an empty file
// will fail `next build`. For phase 02 this is a no-op pass-through;
// Clerk's `clerkMiddleware()` integration replaces the body in phase 09.
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
