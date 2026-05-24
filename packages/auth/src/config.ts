import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  permissions?: string[];
  isProtectedRole?: boolean;
}

export interface AuthAdapter {
  findUserByCredentials: (email: string, password: string) => Promise<AuthUser | null>;
}

export function createAuthOptions(adapter: AuthAdapter): NextAuthOptions {
  return {
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60,      // 24 hours
      updateAge: 60 * 60,        // re-issue JWT once per hour if active
    },
    pages: {
      signIn: "/auth/signin",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await adapter.findUserByCredentials(credentials.email, credentials.password);
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            role: user.role ?? null,
            permissions: user.permissions ?? [],
            isProtectedRole: user.isProtectedRole ?? false,
          };
        },
      }),
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.id = user.id ?? "";
          token.role = user.role ?? null;
          token.permissions = user.permissions ?? [];
          token.isProtectedRole = user.isProtectedRole ?? false;
        }
        return token;
      },
      session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role ?? null;
          session.user.permissions = token.permissions ?? [];
          session.user.isProtectedRole = token.isProtectedRole ?? false;
        }
        return session;
      },
    },
  };
}
