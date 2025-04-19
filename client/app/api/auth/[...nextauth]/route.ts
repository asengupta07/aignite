import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/app/models/User";

interface GithubProfile {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          await connectToDatabase();

          const githubProfile = profile as GithubProfile;
          const githubId = githubProfile.id.toString();

          const existingUser = await User.findOne({ githubId });

          if (!existingUser) {
            await User.create({
              githubId,
              name: user.name,
              email: user.email,
              image: user.image,
            });
            console.log("New user created:", user.email);
          } else {
            await User.findOneAndUpdate(
              { githubId },
              {
                name: user.name,
                email: user.email,
                image: user.image,
              }
            );
            console.log("User updated:", user.email);
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
