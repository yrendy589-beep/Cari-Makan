import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../lib/api.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/cart");
      setItems(data.items || []);
    } catch (err) {
      console.error("Gagal memuat keranjang:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (food) => {
    try {
      const { data } = await api.post("/cart", {
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
      });
      setItems(data.items || []);
    } catch (err) {
      console.error("Gagal menambah ke keranjang:", err.message);
      alert("Gagal menambah ke keranjang. Coba lagi.");
    }
  }, []);

  const updateQty = useCallback(async (id, qty) => {
    try {
      const { data } = await api.put(`/cart/${id}`, { qty });
      setItems(data.items || []);
    } catch (err) {
      console.error("Gagal mengubah keranjang:", err.message);
      alert("Gagal mengubah keranjang. Coba lagi.");
    }
  }, []);

  const removeFromCart = useCallback(async (id) => {
    try {
      const { data } = await api.delete(`/cart/${id}`);
      setItems(data.items || []);
    } catch (err) {
      console.error("Gagal menghapus dari keranjang:", err.message);
      alert("Gagal menghapus dari keranjang. Coba lagi.");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart");
      setItems([]);
    } catch (err) {
      console.error("Gagal menghapus keranjang:", err.message);
      alert("Gagal menghapus keranjang. Coba lagi.");
    }
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}
