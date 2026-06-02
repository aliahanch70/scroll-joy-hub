import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Instaclone" }] }),
  component: Signup,
});

function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[a-z0-9_.]{3,24}$/i.test(username)) {
      setError("Username must be 3-24 chars (letters, numbers, _ or .)");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, username.toLowerCase());
    setLoading(false);
    if (error) setError(error);
    else navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-4xl font-bold text-center" style={{ fontFamily: "'Brush Script MT', cursive" }}>
          Instaclone
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Sign up to share photos and videos.
        </p>
        <form onSubmit={submit} className="space-y-3 border border-border rounded-lg p-6 bg-card">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-ring" />
          <input type="text" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-ring" />
          <input type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-ring" />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-md py-2 text-sm transition">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <div className="text-center text-sm border border-border rounded-lg p-4 bg-card">
          Have an account?{" "}
          <Link to="/login" className="text-sky-400 font-semibold">Log in</Link>
        </div>
      </div>
    </div>
  );
}
