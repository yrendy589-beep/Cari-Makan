import { Link } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-leaf text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-chili text-paper">
            <UtensilsCrossed size={18} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">
            CariMakan
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="hidden font-body text-sm font-medium text-cream/80 transition hover:text-cream sm:inline"
          >
            Menu Hari Ini
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden font-body text-sm font-medium text-cream/80 transition hover:text-cream sm:inline"
            >
              Admin
            </Link>
          )}
          <Link
            to="/keranjang"
            className="relative flex items-center gap-2 rounded-full border border-cream/20 bg-leaf-light px-4 py-2 font-body text-sm font-semibold transition hover:bg-leaf-dark"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-chili px-1 font-mono text-[11px] font-bold text-paper">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-cream/80 sm:block">
                Halo, <strong>{user.name}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-cream/20 bg-cream px-4 py-2 font-body text-sm font-semibold text-leaf transition hover:bg-cream/90"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-cream/20 bg-cream px-4 py-2 font-body text-sm font-semibold text-leaf transition hover:bg-cream/90"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
