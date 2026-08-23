"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session } = useSession();

  const user = session?.user as
    | {
        _id: string;
        name: string;
        username: string;
        email: string;
        role: string;
        fullName?: string;
      }
    | undefined;

  return { user };
}
