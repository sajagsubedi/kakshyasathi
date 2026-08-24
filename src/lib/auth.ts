import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import UserModel from "@/models/User.model";
import SmartBoardModel from "@/models/SmartBoard.model";
import { DeviceStatus, PersonGender, UserRole } from "@/types";
import type { PopulatedClassroom } from "@/types";

import connectDb from "./connectDB";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ============================================================
    // USER LOGIN
    // ============================================================
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

    // ============================================================
    // SMARTBOARD LOGIN
    // ============================================================
    Credentials({
      id: "smartboard",
      name: "SmartBoard",

      credentials: {
        deviceKey: {
          label: "Device Key",
          type: "text",
        },
      },

      async authorize(credentials) {
        console.log("Till here ");
        try {
          await connectDb();

          const deviceKey =
            typeof credentials?.deviceKey === "string"
              ? credentials.deviceKey.trim()
              : "";

          if (!deviceKey) {
            return null;
          }
          console.log("Till here");

          const smartBoard = (await SmartBoardModel.findOne({
            deviceKey,
          }).populate({
            path: "classroom",
            populate: {
              path: "section",
              populate: {
                path: "class",
                select: "name grade",
              },
            },
          })) as
            | (PopulatedClassroom extends never
                ? never
                : Omit<import("@/types").SmartBoardDoc, "classroom"> & {
                    classroom: PopulatedClassroom;
                  })
            | null;

          if (!smartBoard) {
            return null;
          }

          // Make sure the populated relationship exists.
          if (
            !smartBoard.classroom ||
            !smartBoard.classroom.section ||
            !smartBoard.classroom.section.class
          ) {
            console.error(
              `SmartBoard ${smartBoard._id} has an invalid classroom relationship`,
            );

            return null;
          }

          await SmartBoardModel.updateOne(
            { _id: smartBoard._id },
            {
              $set: {
                lastSeenAt: new Date(),
                status: DeviceStatus.online,
              },
            },
          );

          return {
            _id: smartBoard._id.toString(),

            name: `Smart Board - ${smartBoard.classroom.roomNumber}`,

            deviceKey: smartBoard.deviceKey,

            role: UserRole.smartboard,

            classroomId: smartBoard.classroom._id.toString(),

            sectionId: smartBoard.classroom.section._id.toString(),
          };
        } catch (error) {
          console.error("SmartBoard authorize error:", error);

          return null;
        }
      },
    }),
  ],

  // ============================================================
  // CALLBACKS
  // ============================================================

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.gender = user.gender;
        token.role = user.role;

        token.deviceKey = user.deviceKey;
        token.classroomId = user.classroomId;
        token.sectionId = user.sectionId;
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

        session.user.deviceKey = token.deviceKey as string | undefined;
        session.user.classroomId = token.classroomId as string | undefined;
        session.user.sectionId = token.sectionId as string | undefined;
      }

      return session;
    },
  },

  // ============================================================
  // SESSION
  // ============================================================

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
