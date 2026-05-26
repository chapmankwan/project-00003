// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type {Session, User} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username?: string | null;
            email?: string | null;
            image?: string | null;
        } & DefaultSession["user"];
    };

    interface User {
        id: string
    };
};

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
  }
}

