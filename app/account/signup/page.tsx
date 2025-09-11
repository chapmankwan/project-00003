"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errorMessage, setErrorMessage] = useState("");

const handleSignup = async (event: React.FormEvent) => {
	event.preventDefault();
	const res = await fetch("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: { "Content-Type": "application/json" },
	});

	if (res.ok) {
		router.push("/account/login");
	} else {
		const { message } = await res.json();
		setErrorMessage(message || "Signup failed.");
	}
};

return (
	<div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
		<h1 className="text-2xl mb-4 select-none">Sign up and get on track!</h1>

      <form
        className="flex flex-col items-center w-3/4 sm:w-sm"
        onSubmit={handleSignup}
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
			Sign Up
        </button>
        {errorMessage && (
          <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
        )}
      </form>
	</div>
);
}
