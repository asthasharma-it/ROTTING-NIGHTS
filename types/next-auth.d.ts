import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasCompletedQuiz: boolean;
    } & DefaultSession["user"];
  }
}
