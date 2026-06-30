# 🍜 CariMakan — Aplikasi Food Discovery

> Studi Kasus Praktikum React.js: "Membangun CariMakan: Dari Konsep hingga Deployment"

Aplikasi Food Discovery yang memungkinkan pengguna mencari menu makanan, melihat detail resep, dan mengelola keranjang belanja.

---

## ⚙️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React.js (via Vite) |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State Management | Context API |
| Backend | Express.js (Node.js) |
| Database | MySQL |

---

## 🗂️ Struktur Folder

```
Projeck Framework/
├── frontend/               # React App (Vite)
│   └── src/
│       ├── components/     # Komponen reusable
│       │   ├── Header.jsx      # Sesi 1 — Komponen Header
│       │   ├── Footer.jsx      # Sesi 1 — Komponen Footer
│       │   ├── SearchBar.jsx   # Sesi 1 & 2 — SearchBar dengan useState
│       │   ├── FoodCard.jsx    # Sesi 2 — Kartu menu dengan props
│       │   ├── States.jsx      # Sesi 3 — Loading & Error state
│       │   ├── ProtectedRoute.jsx
│       │   └── AdminRoute.jsx
│       ├── pages/          # Halaman aplikasi
│       │   ├── Home.jsx        # Sesi 2 & 3 — Halaman utama + filter real-time
│       │   ├── FoodDetail.jsx  # Sesi 5 — Halaman detail + useParams
│       │   ├── Cart.jsx        # Sesi 6 — Halaman keranjang
│       │   ├── Login.jsx       # Fitur tambahan — Autentikasi
│       │   ├── Register.jsx    # Fitur tambahan — Registrasi
│       │   └── Admin.jsx       # Fitur tambahan — Panel admin
│       ├── context/        # Global State (Sesi 6)
│       │   ├── CartContext.jsx     # Context untuk keranjang belanja
│       │   └── AuthContext.jsx     # Context untuk autentikasi user
│       ├── lib/
│       │   └── api.js          # Axios instance + helper formatRupiah
│       ├── App.jsx             # Sesi 5 — Router & layout utama
│       └── main.jsx            # Entry point + Provider wrapping
├── backend/                # Express.js API Server
│   ├── server.js               # Semua route API
│   ├── package.json
│   └── .env                    # Konfigurasi database
├── database/               # SQL Schema
│   └── makanan.sql             # Struktur tabel & data awal
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- MySQL Server aktif
- Database `warung_db` sudah diimport dari `database/makanan.sql`

### 1. Jalankan Backend

```bash
cd backend
npm install
node server.js
# Server berjalan di http://localhost:4000
```

### 2. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
# App berjalan di http://localhost:5173
```

### 3. Login Default Admin

```
Email    : rendy@admin.com
Password : 12345678
```

---

## 📚 Implementasi Per Sesi

### Sesi 1 — Fondasi & Arsitektur Komponen
**File:** `Header.jsx`, `SearchBar.jsx`, `Footer.jsx`  
Membangun komponen UI dasar yang modular. Setiap komponen memiliki tanggung jawab tunggal.

```jsx
function Header() {
  return <header><h1>CariMakan</h1></header>;
}
```

### Sesi 2 — Dinamisasi dengan Props & State
**File:** `Home.jsx`, `FoodCard.jsx`  
- Data menu disimpan di `useState` (allFoods)
- Filter real-time menggunakan `useMemo + .filter()` saat pengguna mengetik
- Rendering daftar menggunakan `.map()` pada komponen `FoodCard`

```jsx
const [query, setQuery] = useState("");
const filteredFoods = useMemo(() =>
  allFoods.filter(food => food.name.toLowerCase().includes(query)), 
  [query, allFoods]
);
```

### Sesi 3 — Menghubungkan Dunia Luar (API)
**File:** `Home.jsx`, `FoodDetail.jsx`, `lib/api.js`  
- `useEffect` untuk fetch data saat komponen dimount
- Loading state dengan spinner
- Error handling jika request gagal

```jsx
useEffect(() => {
  loadFoods(); // fetch saat pertama kali dimount
}, [loadFoods]);
```

### Sesi 4 — Styling & Layouting Modern
**File:** `tailwind.config.js`, `index.css`, semua komponen  
- Tailwind CSS dengan custom color palette (leaf, cream, chili, gold)
- Responsive grid: `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4`
- Animasi hover: `group-hover:scale-105`, `hover:-translate-y-1`
- Font kustom: Fraunces (display), Plus Jakarta Sans (body), JetBrains Mono

### Sesi 5 — Navigasi Multi-Halaman
**File:** `App.jsx`, `main.jsx`, `Home.jsx`, `FoodDetail.jsx`  
- `BrowserRouter` membungkus seluruh aplikasi
- Route: `/` (Home) → `/menu/:id` (Detail)
- `useParams` untuk mengambil ID dari URL

```jsx
// FoodDetail.jsx
const { id } = useParams(); // mengambil ID dari URL /menu/:id
```

### Sesi 6 — Global State Management (Context API)
**File:** `context/CartContext.jsx`, `Header.jsx`, `FoodDetail.jsx`  
- `CartContext` menyimpan data keranjang secara global
- `CartProvider` membungkus `App.jsx`
- `addToCart`, `updateQty`, `removeFromCart` dapat diakses dari mana saja
- Counter item di Header sinkron di semua halaman

```jsx
// main.jsx — Provider Pattern
<CartProvider>
  <App />
</CartProvider>

// Di komponen manapun
const { addToCart, totalItems } = useCart();
```

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/foods` | Ambil semua menu |
| GET | `/api/foods/:id` | Detail menu by ID |
| GET | `/api/cart` | Lihat isi keranjang |
| POST | `/api/cart` | Tambah item ke keranjang |
| PUT | `/api/cart/:id` | Update qty keranjang |
| DELETE | `/api/cart/:id` | Hapus item keranjang |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Registrasi user |
| GET | `/api/admin/foods` | Kelola menu (admin) |
| POST | `/api/orders` | Buat pesanan |

---

© 2025 CariMakan — Studi Kasus Praktikum React.js
