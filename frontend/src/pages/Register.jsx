import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword });
      setSuccess("Pendaftaran berhasil! Silakan login dengan akun Anda.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-leaf hover:text-chili"
      >
        <ArrowLeft size={16} /> Kembali ke Login
      </Link>

      <div className="overflow-hidden rounded-3xl bg-paper p-8 shadow-ticket">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-wide text-leaf/70">
            CARIMAKAN
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">
            Buat Akun Baru
          </h1>
          <p className="mt-3 max-w-md font-body text-sm text-ink/70">
            Daftarkan diri Anda untuk mulai memesan makanan dan mengelola menu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2 font-body text-sm text-ink/80">
            <span>Nama Lengkap</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-chili focus:ring-2 focus:ring-chili/20"
              required
            />
          </label>

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
              placeholder="Minimal 6 karakter"
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-chili focus:ring-2 focus:ring-chili/20"
              required
            />
          </label>

          <label className="block space-y-2 font-body text-sm text-ink/80">
            <span>Konfirmasi Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password"
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-chili focus:ring-2 focus:ring-chili/20"
              required
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-chili/10 px-4 py-3 text-sm text-chili">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl bg-green-100 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-cream transition hover:bg-leaf-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mendaftar..." : "DAFTAR"}
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
            to="/login"
            className="block text-center rounded-full border border-leaf bg-transparent px-5 py-3 text-sm font-semibold text-leaf transition hover:bg-leaf/10"
          >
            Sudah Punya Akun? Login
          </Link>
        </form>

        <p className="mt-6 text-center text-xs text-ink/50">
          Dengan mendaftar, Anda menyetujui Syarat & Ketentuan kami.
        </p>
      </div>
    </div>
  );
}
