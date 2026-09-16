import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminUser } from "./auth";

export type AdminGuardResult =
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse };

/**
 * Server-side guard for admin-only API routes.
 * Returns `{ authorized: true, userId }` when the session's Discord user is on
 * the admin allowlist, else a 401 JSON response to return directly.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!session?.user || !userId || !isAdminUser(userId)) {
    return {
      authorized: false,
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { authorized: true, userId };
}