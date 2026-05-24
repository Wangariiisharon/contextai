import { signIn, signUp, signInWithGoogle } from "@/app/auth/actions";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome</h1>

      {/* Email/Password Form */}
      <form className="space-y-4 mb-6">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            formAction={signIn}
            className="flex-1 bg-black text-white rounded py-2"
          >
            Sign In
          </button>
          <button formAction={signUp} className="flex-1 border rounded py-2">
            Sign Up
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>

      {/* Google OAuth */}
      <form>
        <button
          formAction={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border rounded py-2"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>
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
