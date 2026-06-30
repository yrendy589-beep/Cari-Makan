require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "warung_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/", (req, res) => {
  res.json({ message: "Backend API berjalan" });
});

app.get("/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/foods", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    let sql = `
      SELECT id, name, description, price, image, category, area
      FROM makanan
      WHERE is_available = 1
    `;
    const params = [];

    if (q) {
      sql += `AND (name LIKE ? OR description LIKE ? OR category LIKE ?) `;
      const keyword = `%${q}%`;
      params.push(keyword, keyword, keyword);
    }

    sql += `ORDER BY id`;

    const [rows] = await pool.execute(sql, params);
    res.json({ meals: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data makanan", error: error.message });
  }
});

app.get("/api/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `
        SELECT id, name, description, price, image, category, area, ingredients, instructions
        FROM makanan
        WHERE id = ? AND is_available = 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    const meal = rows[0];
    // Parse JSON fields if they exist
    if (meal.ingredients && typeof meal.ingredients === "string") {
      meal.ingredients = JSON.parse(meal.ingredients);
    } else if (!meal.ingredients) {
      meal.ingredients = [];
    }
    if (!meal.instructions) {
      meal.instructions = "";
    }

    res.json({ meal });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil detail makanan",
      error: error.message,
    });
  }
});

// Cart endpoints
app.get("/api/cart", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, food_id, name, price, image, qty FROM cart ORDER BY created_at`
    );
    res.json({ items: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil keranjang", error: error.message });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { id, name, price, image } = req.body;

    if (!id || !name || !price || !image) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Check if item already in cart
    const [existing] = await pool.execute(
      `SELECT id, qty FROM cart WHERE food_id = ?`,
      [id]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.execute(
        `UPDATE cart SET qty = qty + 1, updated_at = NOW() WHERE food_id = ?`,
        [id]
      );
    } else {
      // Insert new item
      await pool.execute(
        `INSERT INTO cart (food_id, name, price, image, qty) VALUES (?, ?, ?, ?, 1)`,
        [id, name, price, image]
      );
    }

    // Return updated cart
    const [items] = await pool.execute(
      `SELECT id, food_id, name, price, image, qty FROM cart ORDER BY created_at`
    );
    res.json({ items });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambah ke keranjang", error: error.message });
  }
});

app.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (qty < 1) {
      await pool.execute(`DELETE FROM cart WHERE id = ?`, [id]);
    } else {
      await pool.execute(
        `UPDATE cart SET qty = ?, updated_at = NOW() WHERE id = ?`,
        [qty, id]
      );
    }

    const [items] = await pool.execute(
      `SELECT id, food_id, name, price, image, qty FROM cart ORDER BY created_at`
    );
    res.json({ items });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengubah keranjang", error: error.message });
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(`DELETE FROM cart WHERE id = ?`, [id]);

    const [items] = await pool.execute(
      `SELECT id, food_id, name, price, image, qty FROM cart ORDER BY created_at`
    );
    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus dari keranjang",
      error: error.message,
    });
  }
});

app.delete("/api/cart", async (req, res) => {
  try {
    await pool.execute(`DELETE FROM cart`);
    res.json({ items: [] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menghapus keranjang", error: error.message });
  }
});

// Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password tidak cocok" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Insert new user with role 'user'
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')`,
      [name, email, password]
    );

    res.json({
      message: "Pendaftaran berhasil",
      user: { id: result.insertId, name, email, role: "user" },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mendaftar",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi" });
    }

    // Find user by email
    const [rows] = await pool.execute(
      `SELECT id, name, email, password, role FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const user = rows[0];

    // Compare password (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal login",
      error: error.message,
    });
  }
});

// Admin Food Management Endpoints
app.get("/api/admin/foods", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, description, price, image, category, area, ingredients, instructions, is_available, created_at, updated_at
       FROM makanan
       ORDER BY id DESC`
    );

    // Parse ingredients JSON for each item
    const foods = rows.map((food) => ({
      ...food,
      ingredients: food.ingredients
        ? typeof food.ingredients === "string"
          ? JSON.parse(food.ingredients)
          : food.ingredients
        : null,
    }));

    res.json({ foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data makanan",
      error: error.message,
    });
  }
});

app.post("/api/admin/foods", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      area,
      ingredients,
      instructions,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    // Parse ingredients - if it's a string, try to parse as JSON, otherwise store as string
    let ingredientsJson = null;
    if (ingredients) {
      try {
        ingredientsJson =
          typeof ingredients === "string"
            ? JSON.parse(ingredients)
            : ingredients;
      } catch (e) {
        // If it's plain text, convert to array format or store as is
        ingredientsJson = ingredients;
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO makanan (name, description, price, image, category, area, ingredients, instructions, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        description || "",
        price,
        image || "",
        category || "",
        area || "",
        ingredientsJson ? JSON.stringify(ingredientsJson) : null,
        instructions || "",
      ]
    );

    res.json({
      message: "Makanan berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan makanan",
      error: error.message,
    });
  }
});

app.put("/api/admin/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image,
      category,
      area,
      is_available,
      ingredients,
      instructions,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    // Parse ingredients - if it's a string, try to parse as JSON, otherwise store as string
    let ingredientsJson = null;
    if (ingredients) {
      try {
        ingredientsJson =
          typeof ingredients === "string"
            ? JSON.parse(ingredients)
            : ingredients;
      } catch (e) {
        // If it's plain text, convert to array format or store as is
        ingredientsJson = ingredients;
      }
    }

    await pool.execute(
      `UPDATE makanan 
       SET name = ?, description = ?, price = ?, image = ?, category = ?, area = ?, ingredients = ?, instructions = ?, is_available = ?
       WHERE id = ?`,
      [
        name,
        description || "",
        price,
        image || "",
        category || "",
        area || "",
        ingredientsJson ? JSON.stringify(ingredientsJson) : null,
        instructions || "",
        is_available || 1,
        id,
      ]
    );

    res.json({ message: "Makanan berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui makanan",
      error: error.message,
    });
  }
});

app.delete("/api/admin/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(`DELETE FROM makanan WHERE id = ?`, [id]);
    res.json({ message: "Makanan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus makanan",
      error: error.message,
    });
  }
});

// Order Endpoints
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, userName, userEmail, items, notes } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Data order tidak lengkap" });
    }

    // Calculate total price
    let totalPrice = 0;
    items.forEach((item) => {
      totalPrice += item.price * item.qty;
    });

    // Insert order
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, user_name, user_email, total_price, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, userName, userEmail, totalPrice, notes || ""]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, food_id, food_name, price, qty, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.foodId,
          item.foodName,
          item.price,
          item.qty,
          item.price * item.qty,
        ]
      );
    }

    res.json({
      message: "Order berhasil dibuat",
      orderId: orderId,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal membuat order",
      error: error.message,
    });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, status FROM orders WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    res.json({ order: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil status order",
      error: error.message,
    });
  }
});

// Admin Order Endpoints
app.get("/api/admin/orders", async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT id, user_id, user_name, user_email, total_price, status, notes, created_at, updated_at 
       FROM orders 
       ORDER BY created_at DESC`
    );

    // Get items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT id, food_id, food_name, price, qty, subtotal 
         FROM order_items 
         WHERE order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({ ...order, items });
    }

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data pesanan",
      error: error.message,
    });
  }
});

app.put("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    await pool.execute(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    res.json({ message: "Status order berhasil diupdate" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengupdate order",
      error: error.message,
    });
  }
});

async function ensureDatabaseSchema() {
  const connection = await pool.getConnection();
  try {
    // Create users table
    await connection.query(
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    );

    // Check and add role column if it doesn't exist
    const [roleColumn] = await connection.query(
      `SHOW COLUMNS FROM users LIKE 'role'`
    );
    if (roleColumn.length === 0) {
      await connection.query(
        `ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user'`
      );
    }

    // Insert admin user if not exists
    await connection.query(
      `INSERT IGNORE INTO users (name, email, password, role) VALUES ('Rendy', 'rendy@admin.com', '12345678', 'admin')`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS makanan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price INT NOT NULL,
        image VARCHAR(255),
        category VARCHAR(50),
        area VARCHAR(50),
        ingredients JSON,
        instructions TEXT,
        is_available TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    );

    const [ingredientColumn] = await connection.query(
      `SHOW COLUMNS FROM makanan LIKE 'ingredients'`
    );
    if (ingredientColumn.length === 0) {
      await connection.query(`ALTER TABLE makanan ADD COLUMN ingredients JSON`);
    }

    const [instructionColumn] = await connection.query(
      `SHOW COLUMNS FROM makanan LIKE 'instructions'`
    );
    if (instructionColumn.length === 0) {
      await connection.query(
        `ALTER TABLE makanan ADD COLUMN instructions TEXT`
      );
    }

    await connection.query(
      `CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        food_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        price INT NOT NULL,
        image VARCHAR(255),
        qty INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (food_id) REFERENCES makanan(id)
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL,
        total_price INT NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT NOT NULL,
        food_name VARCHAR(100) NOT NULL,
        price INT NOT NULL,
        qty INT NOT NULL,
        subtotal INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES makanan(id)
      )`
    );

    console.log("Skema database siap");
  } finally {
    connection.release();
  }
}

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

(async () => {
  try {
    await ensureDatabaseSchema();
    console.log("✅ Koneksi database berhasil!");
  } catch (error) {
    console.error("❌ Koneksi database gagal!");
    console.error("   Pesan  :", error.message || "(tidak ada pesan)");
    console.error("   Kode   :", error.code   || "-");
    console.error("   Errno  :", error.errno  || "-");
    console.error("");
    console.error("💡 Kemungkinan penyebab:");
    console.error("   1. MySQL / XAMPP belum dijalankan");
    console.error("   2. Password database salah (cek backend/.env)");
    console.error("   3. Database 'warung_db' belum dibuat");
    console.error("");
    console.error("📋 Konfigurasi saat ini (backend/.env):");
    console.error(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.error(`   User: ${process.env.DB_USER}`);
    console.error(`   DB  : ${process.env.DB_NAME}`);
    process.exit(1);
  }
})();
