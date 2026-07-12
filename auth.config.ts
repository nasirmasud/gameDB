import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (isLoggedIn && auth?.user?.isBanned) {
        const publicPaths = [
          "/",
          "/explore",
          "/games",
          "/genres",
          "/platforms",
          "/news",
          "/login",
          "/register",
        ];
        const isPublic = publicPaths.some((p) => {
          if (p === "/") return pathname === "/";
          return pathname.startsWith(p);
        });
        if (!isPublic) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      const protectedPaths = ["/items/add", "/items/manage", "/wishlist", "/user/dashboard"];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

      const isAdminPath = pathname.startsWith("/admin/dashboard");
      if (isAdminPath) {
        return isLoggedIn && auth?.user?.role === "admin";
      }

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.isBanned = (user as { isBanned?: boolean }).isBanned ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.isBanned = token.isBanned as boolean;
      }
      return session;
    },
  },
  providers: [],
};
