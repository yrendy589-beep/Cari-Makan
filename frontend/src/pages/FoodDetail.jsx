import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { api, formatRupiah } from "../lib/api.js";
import { LoadingState, ErrorState } from "../components/States.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [status, setStatus] = useState("loading");
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const { data } = await api.get(`/foods/${id}`);
      setFood(data.meal || null);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setFood(null);
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    setAdded(false);
  }, [id]);

  if (status === "loading")
    return <LoadingState label="Mengambil detail resep..." />;
  if (status === "error" || !food)
    return <ErrorState message="Menu tidak ditemukan." onRetry={load} />;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-leaf hover:text-chili"
      >
        <ArrowLeft size={16} /> Kembali ke Menu
      </Link>

      <div className="overflow-hidden rounded-3xl bg-paper shadow-ticket">
        <img
          src={food.image}
          alt={food.name}
          className="h-72 w-full object-cover"
        />

        <div className="p-6 sm:p-8">
          <span className="font-mono text-xs uppercase tracking-wide text-leaf/70">
            {food.area} · {food.category}
          </span>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-ink">
              {food.name}
            </h1>
            <span className="font-mono text-2xl font-bold text-chili">
              {formatRupiah(food.price)}
            </span>
          </div>

          <button
            onClick={() => {
              addToCart(food);
              setAdded(true);
            }}
            className="stamp mt-5 flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wide text-ink hover:bg-gold-light"
          >
            <Plus size={16} />
            {added ? "Ditambahkan ✓" : "Pesan Sekarang"}
          </button>

          <div className="mt-8 space-y-8">
            {food.description && (
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Deskripsi
                </h2>
                <p className="font-body text-sm leading-relaxed text-ink/80">
                  {food.description}
                </p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Bahan-bahan
                </h2>
                <ul className="space-y-1.5 font-body text-sm text-ink/80">
                  {Array.isArray(food.ingredients) ? (
                    food.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex justify-between gap-3 border-b border-line pb-1.5"
                      >
                        <span>{ing.name}</span>
                        <span className="font-mono text-xs text-ink/50">
                          {ing.measure}
                        </span>
                      </li>
                    ))
                  ) : food.ingredients ? (
                    <li className="border-b border-line pb-1.5">
                      <span>{food.ingredients}</span>
                    </li>
                  ) : null}
                </ul>
              </div>
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Cara Membuat
                </h2>
                <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink/80">
                  {food.instructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
