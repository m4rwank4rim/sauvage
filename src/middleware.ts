import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => {
      // Only allow users explicitly marked as admin in the JWT through to /admin.
      return Boolean(token?.isAdmin);
    },
  },
});

export const config = {
  // Protect the admin portal page. API routes are guarded server-side via requireAdmin().
  matcher: ["/admin"],
};