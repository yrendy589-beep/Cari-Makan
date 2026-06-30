import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full bg-paper p-1.5 pl-5 shadow-ticket"
    >
      <Search size={18} className="text-ink/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari nasi goreng, ayam, soto..."
        className="flex-1 bg-transparent py-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-chili px-5 py-2.5 font-body text-sm font-semibold text-paper transition hover:bg-chili-dark"
      >
        Cari
      </button>
    </form>
  );
}
