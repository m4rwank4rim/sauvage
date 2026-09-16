import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

/**
 * Admin allowlist — Discord user IDs allowed into /admin.
 * Reads ADMIN_DISCORD_IDS (comma-separated) from the environment.
 */
export function adminDiscordIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** True when the given Discord user ID is on the admin allowlist. */
export function isAdminUser(discordUserId?: string | null): boolean {
  if (!discordUserId) return false;
  return adminDiscordIds().includes(discordUserId);
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: persist the Discord user ID (sub) + admin flag into the token.
      if (user) {
        token.sub = user.id;
        token.isAdmin = isAdminUser(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add the user ID (Discord ID) to the session
        session.user.id = token.sub || "";
        // Add the admin flag so client components can gate admin UI/redirects
        session.user.isAdmin = Boolean(token.isAdmin) || isAdminUser(token.sub);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};