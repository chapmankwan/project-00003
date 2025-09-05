"use client";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';


export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  if ( status === "authenticated" ) { router.push("/workspaces") };
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/workspaces",
    });
  };

  const onKeyDown = (event: { key: string; }) => {
    if ( event.key === "Enter" && password.length && email.length ) {
      handleLogin();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
      {
          <>
            <h1 className="text-2xl mb-4">Login to Monorail</h1>
            <input
              className="p-2 m-2 w-3/4 sm:w-sm bg-slate-700 border border-slate-500 rounded-sm"
              type="email"
              placeholder="Email"
              autoFocus={true}
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="p-2 m-2 w-3/4 sm:w-sm bg-slate-700 border border-slate-500 rounded-sm"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="bg-mint-500 text-slate-900 px-4 py-2 mt-4 w-3/4 sm:w-sm cursor-pointer rounded-sm hover:bg-mint-700 hover:text-slate-100" onClick={handleLogin} onKeyDown={onKeyDown}>
              Sign In
            </button>
          </>
      }

    </div>
  );
}
