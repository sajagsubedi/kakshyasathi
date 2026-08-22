import { UserRole } from "@/models/user.model";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    username: string;
    fullName: string;

    profilePicture: {
      url: string;
      fileId: string;
    } | null;

    userRole: UserRole;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      fullName: string;

      profilePicture: {
        url: string;
        fileId: string;
      } | null;

      userRole: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    fullName: string;

    profilePicture: {
      url: string;
      fileId: string;
    } | null;

    userRole: UserRole;
  }
}