import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      isBanned: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "user" | "admin";
    isBanned?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
    isBanned?: boolean;
    image?: string | null;
  }
}
