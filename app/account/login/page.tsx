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
  const [errorMessage, setErrorMessage] = useState("");

  // Basic email validation for front-end, will update
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) { setErrorMessage("Please enter a valid email address."); return; }; 
    if (!password.trim()) { setErrorMessage("Password cannot be empty."); return; };

    const res = await signIn("credentials", {
      redirect: false, // we handle redirect manually
      email,
      password,
      callbackUrl: "/workspaces",
    });

    if (res?.error) {
      setErrorMessage("Invalid email address or password."); // message from credentials provider
    } else if (res?.ok) {
      router.push("/workspaces");
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
      <h1 className="text-2xl mb-4 select-none">Login to Monorail</h1>

      <form
        className="flex flex-col items-center w-3/4 sm:w-sm"
        onSubmit={handleLogin}
      >
        <input
          className="p-3 m-2 w-3/4 sm:w-sm bg-slate-700 border border-slate-500 rounded-sm transition-transform ease-in-out duration-300 active:scale-95 focus:outline-slate-500"
          type="email"
          placeholder="Email address"
          autoFocus={true}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          
        />
        <input
          className="p-3 m-2 w-3/4 sm:w-sm bg-slate-700 border border-slate-500 rounded-sm transition-transform ease-in-out duration-300 active:scale-95 focus:outline-slate-500"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-mint-500 text-slate-900 px-4 py-2 mt-4 w-3/4 sm:w-sm cursor-pointer rounded-sm transition-transform ease-in-out duration-300 active:scale-95 hover:bg-mint-700 hover:text-slate-100">
          login
        </button>
        {errorMessage && (
          <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
