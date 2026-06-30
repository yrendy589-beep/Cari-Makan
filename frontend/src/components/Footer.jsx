import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-leaf text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-chili">
            <UtensilsCrossed size={16} />
          </span>
          <span className="font-display text-lg font-semibold">CariMakan</span>
        </div>
        <p className="font-body text-sm text-cream/70">
          Dibangun dengan React, Tailwind &amp; Express — semua data menu
          berasal dari API backend.
        </p>
        <p className="font-mono text-xs text-cream/50">
          © {new Date().getFullYear()} CariMakan. Studi kasus praktikum.
        </p>
      </div>
    </footer>
  );
}
