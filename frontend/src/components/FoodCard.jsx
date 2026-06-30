import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatRupiah } from "../lib/api.js";

export default function FoodCard({ food, onAdd }) {
  return (
    <div style={{ perspective: "1000px" }}>
      <div 
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-paper shadow-ticket transition-all duration-500 hover:z-10 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Link to={`/menu/${food.id}`} className="block overflow-hidden" style={{ transform: "translateZ(10px)" }}>
          <img
            src={food.image}
            alt={food.name}
            loading="lazy"
            className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

      {/* perforated tear-line, like an order ticket detaching from the receipt */}
      <div className="ticket-edge" />

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-1">
        <span className="font-mono text-[11px] uppercase tracking-wide text-leaf/70">
          {food.area || food.category}
        </span>
        <Link to={`/menu/${food.id}`}>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink hover:text-chili">
            {food.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-base font-bold text-ink">
            {formatRupiah(food.price)}
          </span>
          <button
            onClick={() => onAdd?.(food)}
            className="stamp flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide text-ink transition hover:bg-gold-light hover:scale-105"
          >
            <Plus size={14} />
            Pesan
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
