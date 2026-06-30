import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import SearchBar from "../components/SearchBar.jsx";
import FoodCard from "../components/FoodCard.jsx";
import { LoadingState, ErrorState } from "../components/States.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  // Sesi 2: useState untuk menyimpan query pencarian, kategori, dan seluruh data menu
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [allFoods, setAllFoods] = useState([]); // semua data dari API (dimuat sekali)
  const [status, setStatus] = useState("loading"); // loading | success | error
  const { addToCart } = useCart();

  // Sesi 3: useEffect — ambil semua data saat komponen pertama kali dimount (mounting)
  const loadFoods = useCallback(async () => {
    setStatus("loading");
    setAllFoods([]);
    try {
      const { data } = await api.get("/foods");
      const meals = Array.isArray(data?.meals) ? data.meals : [];
      setAllFoods(meals);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setAllFoods([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Mengambil daftar unik kategori dari data
  const categories = useMemo(() => {
    if (!allFoods.length) return ["Semua"];
    const uniqueCats = new Set(allFoods.map((f) => f.category).filter(Boolean));
    return ["Semua", ...Array.from(uniqueCats).sort()];
  }, [allFoods]);

  // Sesi 2: Logika Filter — daftar makanan berubah real-time saat pengguna mengetik/pilih kategori
  const filteredFoods = useMemo(() => {
    let result = allFoods;

    // Filter by Kategori
    if (selectedCategory !== "Semua") {
      result = result.filter((food) => food.category === selectedCategory);
    }

    // Filter by Pencarian Text
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (food) =>
          food.name?.toLowerCase().includes(q) ||
          food.description?.toLowerCase().includes(q) ||
          food.category?.toLowerCase().includes(q) ||
          food.area?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [query, selectedCategory, allFoods]);

  const activeLabel = query.trim()
    ? `Hasil untuk "${query.trim()}"`
    : selectedCategory !== "Semua"
    ? `Kategori: ${selectedCategory}`
    : "Menu Hari Ini";

  return (
    <div>
      {/* Hero */}
      <section className="bg-leaf px-5 pb-20 pt-14 text-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-cream/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-gold">
            Warung Digital
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Lapar? Tinggal <span className="text-gold">CariMakan</span>.
          </h1>
          <p className="max-w-md font-body text-cream/75">
            Dari hidangan lezat pilihan chef terbaik hingga makanan favorit sehari-hari —
            semua ada di sini. Pesan sekarang, nikmati dalam hitungan menit. 🍽️
          </p>
          {/* Sesi 2: SearchBar menggunakan useState — filter real-time saat onChange */}
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={(q) => setQuery(q)}
          />
        </div>
      </section>

      {/* Kategori Makanan */}
      {status === "success" && categories.length > 1 && (
        <section className="mx-auto max-w-6xl px-5 pt-8">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 font-mono text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-chili text-paper shadow-md"
                    : "bg-paper text-ink/70 shadow-sm hover:bg-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Menu grid */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {activeLabel}
          </h2>
          {status === "success" && (
            <span className="font-mono text-xs text-ink/50">
              {filteredFoods.length} menu
            </span>
          )}
        </div>

        {/* Sesi 3: Loading State — ditampilkan saat data sedang diambil */}
        {status === "loading" && <LoadingState />}

        {/* Sesi 3: Error Handling — ditampilkan jika request gagal */}
        {status === "error" && (
          <ErrorState
            message="Gagal memuat data dari supplier. Periksa koneksi backend."
            onRetry={loadFoods}
          />
        )}

        {status === "success" && filteredFoods.length === 0 && (
          <p className="py-16 text-center font-body text-ink/60">
            Tidak ada menu yang cocok dengan pencarianmu.
          </p>
        )}

        {/* Sesi 2: Rendering FoodCard menggunakan .map() */}
        {status === "success" && filteredFoods.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
