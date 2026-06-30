import { Loader2, TriangleAlert } from "lucide-react";

export function LoadingState({ label = "Sedang menunggu stok dari dapur..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink/60">
      <Loader2 className="animate-spin text-chili" size={32} />
      <p className="font-body text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Gagal memuat data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-chili/10 text-chili">
        <TriangleAlert size={22} />
      </span>
      <p className="max-w-xs font-body text-sm text-ink/70">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-leaf px-4 py-2 font-body text-sm font-semibold text-cream hover:bg-leaf-light"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
