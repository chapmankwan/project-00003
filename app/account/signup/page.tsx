"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errorMsg, setErrorMsg] = useState("");

const handleSignup = async () => {
	const res = await fetch("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: { "Content-Type": "application/json" },
	});

	if (res.ok) {
		router.push("/account/login");
	} else {
		const { message } = await res.json();
		setErrorMsg(message || "Signup failed.");
	}
};

return (
	<div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
		<h1 className="text-2xl mb-4">Sign up for Monorail</h1>
		{errorMsg && <p className="text-red-400">{errorMsg}</p>}
		<input
			className="p-2 m-2 bg-slate-700 border border-slate-500"
			type="email"
			placeholder="Email"
			value={email}
			onChange={e => setEmail(e.target.value)}
		/>
		<input
			className="p-2 m-2 bg-slate-700 border border-slate-500"
			type="password"
			placeholder="Password"
			value={password}
			onChange={e => setPassword(e.target.value)}
		/>
		<button className="bg-mint-500 text-slate-900 px-4 py-2 mt-4" onClick={handleSignup}>
			Sign Up
		</button>
	</div>
);
}
