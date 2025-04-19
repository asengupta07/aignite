import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/app/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo read:org",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          await connectToDatabase();

          // Check if user already exists
          const existingUser = await User.findOne({ github_id: profile?.sub });

          if (!existingUser) {
            // Create new user
            await User.create({
              github_id: profile?.sub,
              name: user.name,
              email: user.email,
              image: user.image,
            });
          } else {
            // Update existing user
            await User.findOneAndUpdate(
              { github_id: profile?.sub },
              {
                name: user.name,
                email: user.email,
                image: user.image,
              }
            );
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
};

export { authOptions as GET, authOptions as POST };
