import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Admin gate for protected route handlers.
 *
 * Uses the Clerk Backend API directly (`clerkClient().users.getUser()`)
 * to read `publicMetadata.role` rather than session-token claims.
 * Reasons:
 *   - publicMetadata is NOT in JWT claims by default
 *   - customizing the session template to include it is brittle
 *   - one extra HTTP call per protected request is cheap on the scale
 *     this dashboard operates at
 *
 * Admin role is assigned manually in the Clerk dashboard:
 *   Users → <your user> → Public Metadata → { "role": "admin" }
 */
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    throw NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return user;
}
