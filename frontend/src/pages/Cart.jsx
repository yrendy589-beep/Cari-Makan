import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatRupiah } from "../lib/api.js";
import { LoadingState } from "../components/States.jsx";

export default function Cart() {
  const { items, loading, totalPrice, updateQty, removeFromCart, clearCart } =
    useCart();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");

  // Polling status pesanan
  useEffect(() => {
    let interval;
    if (receipt && receipt.orderId && orderStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/orders/${receipt.orderId}`);
          const data = await res.json();
          if (data.order && data.order.status === "completed") {
            setOrderStatus("completed");
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // cek setiap 3 detik
    }
    return () => clearInterval(interval);
  }, [receipt, orderStatus]);

  const handleCheckout = async () => {
    if (items.length === 0 || !user) return;

    setCheckoutLoading(true);
    setOrderError("");

    try {
      const orderItems = items.map((item) => ({
        foodId: item.food_id,
        foodName: item.name,
        price: item.price,
        qty: item.qty,
      }));

      const response = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          items: orderItems,
          notes: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout gagal");
      }

      const order = {
        number: `CM-${data.orderId}`,
        date: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        items,
        total: totalPrice,
        orderId: data.orderId,
      };

      setReceipt(order);
      setOrderStatus("pending");
      await clearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      setOrderError(error.message || "Gagal membuat pesanan");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <LoadingState label="Membuka keranjangmu..." />;

  if (receipt) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16" style={{ perspective: "1000px" }}>
        {/* Kontainer Utama Struk */}
        <div 
          className="relative mx-auto overflow-hidden rounded-t-3xl bg-paper transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] shadow-[0_25px_50px_rgba(0,0,0,0.2)]"
          style={{ transform: "rotateX(8deg)", transformStyle: "preserve-3d" }}
        >
          {/* Header Struk */}
          <div className="bg-leaf px-8 py-10 text-center text-cream" style={{ transform: "translateZ(20px)" }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream/10 text-gold">
              <ShoppingBag size={24} />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-gold/80">
              Struk Pesanan
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold">
              Terima Kasih!
            </h1>
            
            {/* Indikator Status Pesanan */}
            <div className="mt-4 inline-block">
              {orderStatus === "completed" ? (
                <div className="rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-bold text-green-300 border border-green-500/50 flex items-center gap-2">
                  <CheckCircle size={16} /> Pesanan Tervalidasi
                </div>
              ) : (
                <div className="rounded-full bg-yellow-500/20 px-4 py-1.5 text-sm font-bold text-yellow-300 border border-yellow-500/50 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                  Menunggu Validasi Admin...
                </div>
              )}
            </div>
          </div>

          {/* Garis Potong (Ticket Edge) */}
          <div className="ticket-edge relative z-10 -mt-1 h-3 rotate-180 bg-leaf"></div>

          {/* Body Struk */}
          <div className="px-8 pb-10 pt-8">
            <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-line pb-6">
              <div>
                <p className="font-mono text-xs text-ink/50 uppercase tracking-wide">Nomor Pesanan</p>
                <p className="mt-1 font-body text-base font-semibold text-ink">{receipt.number}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-ink/50 uppercase tracking-wide">Tanggal</p>
                <p className="mt-1 font-body text-base font-semibold text-ink">{receipt.date}</p>
              </div>
            </div>

            {/* Daftar Item */}
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Detail Pesanan</p>
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-bold text-leaf">{item.qty}x</span>
                    <div>
                      <p className="font-display text-base font-semibold text-ink leading-tight">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-semibold text-ink">
                    {formatRupiah(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 border-t-2 border-dashed border-line pt-6">
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-bold text-ink uppercase tracking-wide">Total Bayar</span>
                <span className="font-mono text-2xl font-bold text-chili">
                  {formatRupiah(receipt.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Bagian Bawah Struk (Bergerigi) */}
          <div className="ticket-edge bg-paper opacity-50"></div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/"
            className="inline-flex justify-center rounded-full border-2 border-leaf/20 bg-transparent px-8 py-3.5 font-body text-sm font-semibold text-leaf transition hover:bg-leaf/5"
          >
            Kembali ke Menu
          </Link>
          {/* Tombol cetak struk dihapus dari sisi pelanggan */}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 flex items-center gap-2 font-display text-3xl font-bold text-ink">
        <ShoppingBag className="text-chili" /> Keranjang Pesanan
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-paper py-16 text-center shadow-ticket">
          <p className="font-body text-ink/60">Keranjangmu masih kosong.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-chili px-5 py-2.5 font-body text-sm font-semibold text-paper hover:bg-chili-dark"
          >
            Cari Menu Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-paper p-4 shadow-ticket"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-display font-semibold text-ink">
                  {item.name}
                </h3>
                <p className="font-mono text-sm text-ink/60">
                  {formatRupiah(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  disabled={item.qty <= 1}
                  className="grid h-7 w-7 place-items-center rounded-full text-ink/70 hover:bg-cream disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-mono text-sm">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="grid h-7 w-7 place-items-center rounded-full text-ink/70 hover:bg-cream"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="grid h-9 w-9 place-items-center rounded-full text-ink/40 hover:bg-chili/10 hover:text-chili"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {orderError && (
            <div className="rounded-2xl bg-chili/10 px-4 py-3 text-sm text-chili">
              {orderError}
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl bg-leaf px-6 py-5 text-cream shadow-ticket">
            <div>
              <p className="font-body text-sm text-cream/70">Total Pesanan</p>
              <p className="font-mono text-2xl font-bold">
                {formatRupiah(totalPrice)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                disabled={checkoutLoading}
                className="rounded-full border border-cream/30 px-4 py-2 font-body text-sm font-semibold hover:bg-leaf-light disabled:opacity-60"
              >
                Kosongkan
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="rounded-full bg-gold px-5 py-2 font-body text-sm font-bold text-ink hover:bg-gold-light disabled:opacity-60"
              >
                {checkoutLoading ? "Memproses..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
