/**
 * Seed Script: Ambil data dari TheMealDB API → masukkan ke database warung_db
 * Jalankan: node database/seed_themealdb.js
 */

require("dotenv").config({ path: "./.env" });
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "warung_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Daftar keyword untuk search (supaya dapat variasi makanan)
const SEARCH_KEYWORDS = [
  "chicken", "beef", "lamb", "pasta", "seafood",
  "rice", "soup", "salad", "cake", "fish"
];

// Harga acak yang masuk akal (dalam Rupiah)
const PRICE_RANGES = {
  "Chicken":    [25000, 45000],
  "Beef":       [35000, 65000],
  "Lamb":       [40000, 70000],
  "Pasta":      [30000, 55000],
  "Seafood":    [35000, 60000],
  "Rice":       [20000, 40000],
  "Soup":       [18000, 38000],
  "Salad":      [15000, 30000],
  "Dessert":    [12000, 28000],
  "Cake":       [15000, 35000],
  "Fish":       [30000, 55000],
  "default":    [20000, 50000],
};

function getRandomPrice(category) {
  const range = PRICE_RANGES[category] || PRICE_RANGES["default"];
  const min = range[0];
  const max = range[1];
  // Bulatkan ke ribuan terdekat
  const raw = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(raw / 1000) * 1000;
}

function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name    = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({
        name:    name.trim(),
        measure: (measure || "").trim(),
      });
    }
  }
  return ingredients;
}

async function fetchMeals(keyword) {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals || [];
}

async function main() {
  console.log("🔗 Menghubungkan ke database...");
  const conn = await pool.getConnection();
  console.log("✅ Database terhubung!\n");

  // Hapus data lama
  console.log("🗑️  Menghapus data makanan lama...");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
  await conn.execute("TRUNCATE TABLE cart");
  await conn.execute("TRUNCATE TABLE order_items");
  await conn.execute("TRUNCATE TABLE orders");
  await conn.execute("TRUNCATE TABLE makanan");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("✅ Data lama dihapus!\n");

  // Fetch data dari TheMealDB
  const allMeals = new Map(); // pakai Map agar tidak duplikat by idMeal

  console.log("🌐 Mengambil data dari TheMealDB API...");
  for (const keyword of SEARCH_KEYWORDS) {
    process.stdout.write(`   Fetching: "${keyword}"... `);
    try {
      const meals = await fetchMeals(keyword);
      meals.forEach((m) => allMeals.set(m.idMeal, m));
      console.log(`${meals.length} hasil`);
    } catch (err) {
      console.log(`❌ Gagal: ${err.message}`);
    }
    // Jeda 200ms agar tidak spam API
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n📦 Total unik: ${allMeals.size} makanan\n`);

  // Insert ke database
  let inserted = 0;
  let failed   = 0;

  console.log("💾 Menyimpan ke database...");
  for (const meal of allMeals.values()) {
    try {
      const ingredients  = extractIngredients(meal);
      const price        = getRandomPrice(meal.strCategory);
      const description  = meal.strInstructions
        ? meal.strInstructions.slice(0, 300).replace(/\r?\n/g, " ").trim() + "..."
        : "";
      const instructions = meal.strInstructions || "";

      await conn.execute(
        `INSERT INTO makanan (name, description, price, image, category, area, ingredients, instructions, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          meal.strMeal,
          description,
          price,
          meal.strMealThumb || "",
          meal.strCategory  || "",
          meal.strArea      || "",
          JSON.stringify(ingredients),
          instructions,
        ]
      );
      inserted++;
      process.stdout.write(`\r   ✅ Tersimpan: ${inserted} menu`);
    } catch (err) {
      failed++;
    }
  }

  console.log(`\n\n🎉 Selesai!`);
  console.log(`   ✅ Berhasil dimasukkan : ${inserted} makanan`);
  if (failed > 0) console.log(`   ❌ Gagal             : ${failed} makanan`);

  // Verifikasi
  const [rows] = await conn.execute("SELECT COUNT(*) as total FROM makanan");
  console.log(`\n📊 Total makanan di database: ${rows[0].total}`);

  // Preview 5 pertama
  const [preview] = await conn.execute(
    "SELECT id, name, category, area, price FROM makanan ORDER BY id LIMIT 5"
  );
  console.log("\n📋 Preview 5 menu pertama:");
  preview.forEach((m) => {
    console.log(`   [${m.id}] ${m.name} | ${m.category} | ${m.area} | Rp ${m.price.toLocaleString("id-ID")}`);
  });

  conn.release();
  await pool.end();
  console.log("\n✅ Koneksi database ditutup.");
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
