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
      authorization: {
        params: {
          scope: "repo read:org user:email read:user",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          await connectToDatabase();

          const githubProfile = profile as GithubProfile;
          const github_id = githubProfile.id.toString();

          const existingUser = await User.findOne({ github_id: github_id });

          if (!user.email) {
            console.error("No email provided by GitHub");
            return false;
          }

          if (!existingUser) {
            await User.create({
              github_id: github_id,
              name: user.name,
              email: user.email,
              image: user.image,
            });
            console.log("New user created:", user.email);
          } else {
            await User.findOneAndUpdate(
              { github_id: github_id },
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
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub!;
        session.accessToken = token.accessToken as string;
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          session.user.github_id = user.github_id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
