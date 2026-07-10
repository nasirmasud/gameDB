import type { NextAuthConfig } from "next-auth";

/**
 * This config is split out from auth.ts because middleware runs on the
 * Edge runtime, which cannot use mongoose/bcrypt. Keep this file free of
 * any Node-only imports.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPaths = ["/items/add", "/items/manage", "/wishlist", "/admin"];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

      const isAdminPath = pathname.startsWith("/admin");
      if (isAdminPath) {
        return isLoggedIn && auth?.user?.role === "admin";
      }

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
    // Carries role/id from token into the session on every request
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
  },
  providers: [], // actual providers are added in auth.ts (Node runtime)
};
