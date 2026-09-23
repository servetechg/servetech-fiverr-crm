import type { UserRole } from "@prisma/client";

export {};

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: UserRole;
      fullName: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    role?: UserRole;
    fullName?: string;
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: number;
      role: UserRole;
      fullName: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: number;
    role?: UserRole;
    fullName?: string;
  }
}
