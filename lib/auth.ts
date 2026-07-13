import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const providers = [];

if (hasGoogleCreds) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Dev fallback so the app is fully testable before Google OAuth credentials exist.
providers.push(
  Credentials({
    id: "guest",
    name: "Guest",
    credentials: { name: { label: "Name", type: "text" } },
    async authorize(credentials) {
      const rawName = (credentials?.name as string) || "";
      const name = rawName.trim() || "Guest";
      const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@guest.local`;
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email },
      });
      return user;
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { hasCompletedQuiz: true },
        });
        session.user.hasCompletedQuiz = dbUser?.hasCompletedQuiz ?? false;
      }
      return session;
    },
  },
});

export const googleSignInEnabled = hasGoogleCreds;
