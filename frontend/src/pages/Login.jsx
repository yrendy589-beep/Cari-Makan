import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-leaf hover:text-chili"
      >
        <ArrowLeft size={16} /> Kembali ke Menu
      </Link>

      <div className="overflow-hidden rounded-3xl bg-paper p-8 shadow-ticket">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-wide text-leaf/70">
            CARIMAKAN
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">
            Masuk ke Akun
          </h1>
          <p className="mt-3 max-w-md font-body text-sm text-ink/70">
            Masuk dengan akun Anda untuk memesan makanan dan mengelola menu.
          </p>
        </div>

        {user ? (
          <div className="space-y-4 rounded-3xl border border-line bg-cream p-6 text-ink">
            <p className="font-body text-sm">
              Anda sudah login sebagai <strong>{user.name}</strong> (
              {user.email}).
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="inline-flex items-center justify-center rounded-full bg-chili px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-chili/90"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2 font-body text-sm text-ink/80">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-chili focus:ring-2 focus:ring-chili/20"
                required
              />
            </label>

            <label className="block space-y-2 font-body text-sm text-ink/80">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-chili focus:ring-2 focus:ring-chili/20"
                required
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-chili/10 px-4 py-3 text-sm text-chili">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-cream transition hover:bg-leaf-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Masuk..." : "LOGIN"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-paper px-2 text-ink/60">atau</span>
              </div>
            </div>

            <Link
              to="/register"
              className="block text-center rounded-full border border-leaf bg-transparent px-5 py-3 text-sm font-semibold text-leaf transition hover:bg-leaf/10"
            >
              Daftar Akun Baru
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
