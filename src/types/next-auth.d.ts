import { DefaultSession } from "next-auth";
import { PersonGender, UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    gender: PersonGender;
    role: UserRole;
  }

  interface Session {
    user: {
      _id: string;
      name: string;
      username: string;
      email: string;
      gender: PersonGender;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    name: string;
    username: string;
    email: string;
    gender: PersonGender;
    role: UserRole;
  }
}
