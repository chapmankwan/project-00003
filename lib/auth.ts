import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import {User} from "@/models/User";
import bcrypt from "bcryptjs";

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
            user.hashedPassword
            );
            if (!isValid) return null;

            return {
                id: user._id.toString(),
                email: user.email,
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
            token.id = user.id; // you can set this for consistency
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
            session.user.id = (token.id ?? token.sub) as string;
            }
            return session;
        },
    },
};
