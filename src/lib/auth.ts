import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import UserModel from "@/models/User.model";
import { PersonGender, UserRole } from "@/types";
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
            name: existingUser.name,
            username: existingUser.username,
            email: existingUser.email,
            gender: existingUser.gender,
            role: existingUser.role,
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
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.gender = user.gender;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.gender = token.gender as PersonGender;
        session.user.role = token.role as UserRole;
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
