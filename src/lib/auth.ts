import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import UserModel, { UserRole } from "@/models/user.model";
import connectDb from "./connectDB";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          await connectDb();

          const { username, password } =
            await signInSchema.parseAsync(credentials);

          const existingUser = await UserModel.findOne({
            username: username.trim().toLowerCase(),
          });

          if (!existingUser) {
            return null;
          }

          const isPasswordCorrect =
            await existingUser.isPasswordCorrect(password);

          if (!isPasswordCorrect) {
            return null;
          }

          return {
            _id: existingUser._id.toString(),

            username: existingUser.username,

            fullName: existingUser.fullName,

            profilePicture: existingUser.profilePicture ?? null,

            userRole: existingUser.userRole,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }

          console.error("NextAuth authorize error:", error);

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.fullName = user.fullName;
        token.profilePicture = user.profilePicture ?? null;
        token.userRole = user.userRole;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.fullName = token.fullName as string;
        session.user.profilePicture = (token.profilePicture ?? null) as {
          url: string;
          fileId: string;
        } | null;
        session.user.userRole = token.userRole as UserRole;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",

    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
