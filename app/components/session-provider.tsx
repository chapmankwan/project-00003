"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export const SessionProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}) => {
  return (
    <NextAuthSessionProvider session={session}>
        {children}
    </NextAuthSessionProvider>
  );
}
