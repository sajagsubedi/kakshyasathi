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
    userRole: UserRole | "SMARTBOARD";
    sectionId?: string | null;
    deviceId?: string | null;
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
      userRole: UserRole | "SMARTBOARD";
      sectionId?: string | null;
      deviceId?: string | null;
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
    userRole: UserRole | "SMARTBOARD";
    sectionId?: string | null;
    deviceId?: string | null;
  }
}
