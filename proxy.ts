// Next.js 16 renamed `middleware.ts` to `proxy.ts`. Clerk's
// `clerkMiddleware` works identically — only the filename changed.

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // /api/analytics/track is a public beacon — must be reachable by
  // anonymous visitors. Everything else under /api/analytics, plus
  // /dashboard and /api/submissions, requires a signed-in user.
  const isPublicAnalytics = pathname === "/api/analytics/track";
  const requiresAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/submissions") ||
    (pathname.startsWith("/api/analytics") && !isPublicAnalytics);

  if (requiresAuth) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
