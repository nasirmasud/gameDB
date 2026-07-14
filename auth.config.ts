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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.isBanned = (user as { isBanned?: boolean }).isBanned ?? false;
        token.image = (user as { image?: string | null }).image ?? null;
      }
      if (trigger === "update" && session) {
        token.name = (session as { name?: string }).name ?? token.name;
        token.image = (session as { image?: string | null }).image ?? token.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.isBanned = token.isBanned as boolean;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
  providers: [],
};
