import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import UserModel, { UserRole } from "@/models/user.model";
import SmartBoardModel from "@/models/smartboard.model";
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
            id: existingUser._id.toString(),
            _id: existingUser._id.toString(),
            username: existingUser.username,
            fullName: existingUser.fullName,
            profilePicture: existingUser.profilePicture ?? null,
            userRole: existingUser.userRole,
            sectionId: existingUser.sectionId?.toString() ?? null,
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
    Credentials({
      id: "smartboard",
      name: "SmartBoard",

      credentials: {
        deviceId: { label: "Device ID", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectDb();

          const deviceId = credentials?.deviceId as string;
          const password = credentials?.password as string;

          if (!deviceId || !password) return null;

          const board = await SmartBoardModel.findOne({
            deviceId: deviceId.trim().toUpperCase(),
          });

          if (!board || !(await board.isPasswordCorrect(password))) {
            return null;
          }

          board.status = "ONLINE";
          board.lastSeenAt = new Date();
          await board.save();

          return {
            id: board._id.toString(),
            _id: board._id.toString(),
            username: board.deviceId,
            fullName: board.name,
            profilePicture: null,
            userRole: "SMARTBOARD" as const,
            sectionId: board.sectionId.toString(),
            deviceId: board.deviceId,
          };
        } catch (error) {
          console.error("SmartBoard authorize error:", error);
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
        token.sectionId = user.sectionId ?? null;
        token.deviceId = user.deviceId ?? null;
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
        session.user.userRole = token.userRole as UserRole | "SMARTBOARD";
        session.user.sectionId = (token.sectionId as string | null) ?? null;
        session.user.deviceId = (token.deviceId as string | null) ?? null;
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
