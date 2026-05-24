"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utills/supabase/client";

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data?.session || data?.user) {
      router.push("/dashboard");
      return;
    }

    setInfoMessage(
      "Check your email for a confirmation link to complete sign up.",
    );
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      <form onSubmit={handleSignUp} className="space-y-4 mb-6">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 border rounded py-2"
            disabled={loading}
          >
            Sign Up
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
      )}
      {infoMessage && (
        <div className="mb-4 text-slate-600 text-sm">{infoMessage}</div>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 border rounded py-2"
        disabled={loading}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      {/* Google's G icon paths */}
    </svg>
  );
}
