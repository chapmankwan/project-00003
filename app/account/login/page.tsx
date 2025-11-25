"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/workspaces");
    }
  }, [status, router]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Basic email validation for front-end, will update
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateEmail(email)) { setErrorMessage("Please enter a valid email address."); return; }; 
    if (!password.trim()) { setErrorMessage("Password cannot be empty."); return; };

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false, // we handle redirect manually
        email,
        password,
        callbackUrl: "/workspaces",
      });

      if (res?.error) {
        setErrorMessage("Invalid email address or password."); // message from credentials provider
      } else {
        setSuccess("Login successful! Redirecting...");

        setTimeout(() => router.push("/workspaces"), 1000);
      }
    } catch (err) {
      console.log("Error occurred:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mono-800 text-white">
      <h1 className="text-2xl mb-4 select-none">Login to Monorail</h1>

      <form
        className="flex flex-col items-center w-3/4 sm:w-sm"
        onSubmit={handleLogin}
      >
        <input
          className="p-3 m-2 w-3/4 sm:w-sm bg-mono-700 border border-mono-500 rounded-sm transition-transform ease-in-out duration-300 active:scale-95 focus:outline-mono-500"
          type="email"
          placeholder="Email address"
          autoFocus={true}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-invalid={!!errorMessage && !validateEmail(email)}
        />
        <input
          className="p-3 m-2 w-3/4 sm:w-sm bg-mono-700 border border-mono-500 rounded-sm transition-transform ease-in-out duration-300 active:scale-95 focus:outline-mono-500"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          aria-invalid={!!errorMessage && !password}
        />
        <button type="submit" className={`px-4 py-2 mt-4 w-3/4 sm:w-sm cursor-pointer rounded-sm transition-transform ease-in-out duration-300 active:scale-95"
          ${
              loading
                ? "bg-mono-600 text-mono-300 cursor-not-allowed"
                : "bg-mint-500 text-mono-900 hover:bg-mint-700 hover:text-mono-100"
            }`}
          >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="h-12 flex flex-col items-center justify-center">
          <p className="text-red-400 text-sm mt-2 select-none">{errorMessage}</p>
          <p className="text-mint-400 text-sm mt-2">{success}</p>
        </div>
      </form>
    </div>
  );
}
