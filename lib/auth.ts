import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import {User} from "@/models";
import bcrypt from "bcryptjs";

type AuthUser = {
    id: string;
    email: string;
    username?: string;
};

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            await connectToDatabase();

            const user = await User.findOne({ email: credentials?.email });
            if (!user) return null;

            const isValid = await bcrypt.compare(
                credentials!.password,
                user.hashedPassword,
            );
            if (!isValid) return null;

            return {
                id: user._id?.toString() ?? user.id,
                email: user.email,
                username: user.username,
            };
        },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/account/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token.id = user.id;
                token.username = (user as AuthUser).username ?? token.username;
            }

            if (!token.username && token.id) {
                await connectToDatabase();
                const dbUser = await User.findById(token.id)
                    .select("username")
                    .lean<{ username?: string }>();

                if (dbUser?.username) {
                    token.username = dbUser.username;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id ?? token.sub) as string;
                session.user.username = (token.username ?? null) as string | null;
            }
            return session;
        },
    },
};
