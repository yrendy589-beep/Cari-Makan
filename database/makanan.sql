-- Database untuk menampilkan menu makanan di frontend
CREATE DATABASE IF NOT EXISTS warung_db;
USE warung_db;

-- Tabel users untuk autentikasi
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed admin user
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Rendy', 'rendy@admin.com', '12345678', 'admin');

CREATE TABLE IF NOT EXISTS makanan (
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
);

CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    image VARCHAR(255),
    qty INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_id) REFERENCES makanan(id)
);

CREATE TABLE IF NOT EXISTS orders (
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
);

CREATE TABLE IF NOT EXISTS order_items (
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
);

-- Sample data makanan yang cocok untuk frontend
INSERT INTO makanan (id, name, description, price, image, category, area, ingredients, instructions, is_available) VALUES
(1, 'Nasi Goreng Spesial', 'Nasi goreng dengan ayam, telur, dan sambal khas.', 25000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 'Makanan Utama', 'Indonesia', '[{"name": "Nasi Putih", "measure": "2 piring"}, {"name": "Ayam Fillet", "measure": "150g"}, {"name": "Telur", "measure": "2 butir"}, {"name": "Sambal", "measure": "2 sdm"}, {"name": "Minyak Wijen", "measure": "1 sdt"}]', '1. Panaskan minyak di wajan besar\n2. Masukkan nasi, aduk rata\n3. Tambahkan ayam dan telur\n4. Masukkan sambal dan minyak wijen\n5. Aduk hingga merata dan matang', 1),
(2, 'Mie Ayam Bakso', 'Mie ayam dengan bakso dan pangsit yang lezat.', 22000, 'https://images.unsplash.com/photo-1556316918-0b3a2f2b0d7f?auto=format&fit=crop&w=800&q=80', 'Mie', 'Jawa', '[{"name": "Mie Telur", "measure": "200g"}, {"name": "Ayam Dada", "measure": "100g"}, {"name": "Bakso Sapi", "measure": "5 biji"}, {"name": "Pangsit", "measure": "4 biji"}, {"name": "Kuah Kaldu", "measure": "500ml"}]', '1. Rebus mie hingga matang\n2. Siapkan kuah kaldu yang sudah panas\n3. Potong daging ayam dan rebus dengan bakso\n4. Tuang kuah ke mie\n5. Tambahkan pangsit dan lauk lainnya', 1),
(3, 'Sate Ayam', 'Sate ayam dengan bumbu kacang dan lontong.', 28000, 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e2?auto=format&fit=crop&w=800&q=80', 'Sate', 'Jawa', '[{"name": "Daging Ayam", "measure": "300g"}, {"name": "Bumbu Kacang", "measure": "200g"}, {"name": "Lontong", "measure": "2 potong"}, {"name": "Kecap Manis", "measure": "3 sdm"}, {"name": "Tusuk Sate", "measure": "10 pcs"}]', '1. Potong ayam dan tusukkan ke dalam tusuk sate\n2. Panggang hingga matang di atas bara api\n3. Siapkan bumbu kacang yang sudah halus\n4. Celupkan sate ke bumbu kacang\n5. Sajikan dengan lontong dan kecap manis', 1),
(4, 'Bakso Bakar', 'Bakso dengan saus pedas manis dan topping lengkap.', 23000, 'https://images.unsplash.com/photo-1571076401301-2d59d5b0c2c1?auto=format&fit=crop&w=800&q=80', 'Bakso', 'Indonesia', '[{"name": "Bakso Sapi", "measure": "200g"}, {"name": "Saus Pedas", "measure": "4 sdm"}, {"name": "Kecap Manis", "measure": "2 sdm"}, {"name": "Bawang Goreng", "measure": "2 sdm"}, {"name": "Cheese", "measure": "30g"}]', '1. Tusukkan bakso ke dalam tusuk kayu\n2. Bakar di atas api hingga matang merata\n3. Siapkan saus pedas manis\n4. Celupkan bakso yang sudah matang ke saus\n5. Taburi dengan bawang goreng dan cheese', 1),
(5, 'Ayam Geprek', 'Ayam geprek crispy dengan sambal pedas.', 20000, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'Ayam', 'Jawa', '[{"name": "Ayam Kampung", "measure": "1 ekor"}, {"name": "Sambal Matah", "measure": "5 sdm"}, {"name": "Jeruk Nipis", "measure": "2 buah"}, {"name": "Telur", "measure": "2 butir"}, {"name": "Tepung Terigu", "measure": "100g"}]', '1. Lumuri ayam dengan telur dan tepung terigu\n2. Goreng hingga kulit berubah kuning kecokelatan\n3. Geprek ayam yang sudah matang dengan sambal matah\n4. Tambahkan perasan jeruk nipis\n5. Sajikan segera selagi hangat', 1),
(6, 'Rendang', 'Rendang sapi khas Padang yang empuk dan beraroma.', 32000, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'Daging', 'Padang', '[{"name": "Daging Sapi", "measure": "400g"}, {"name": "Santan Kelapa", "measure": "500ml"}, {"name": "Bumbu Rendang", "measure": "5 sdm"}, {"name": "Garam", "measure": "1 sdt"}, {"name": "Gula Merah", "measure": "2 sdm"}]', '1. Cuci dan potong daging sapi\n2. Masukkan ke dalam panci dengan santan\n3. Tambahkan bumbu rendang dan garam\n4. Masak dengan api kecil hingga santan mengental\n5. Tambahkan gula merah dan aduk rata', 1),
(7, 'Soto Ayam', 'Soto ayam hangat dengan kentang, telur, dan koya.', 18000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 'Sup', 'Jawa', '[{"name": "Ayam Kampung", "measure": "1 ekor"}, {"name": "Kunyit", "measure": "2 rimpang"}, {"name": "Kentang", "measure": "2 buah"}, {"name": "Telur", "measure": "2 butir"}, {"name": "Kuah Kaldu", "measure": "1 liter"}]', '1. Rebus ayam hingga matang bersama kunyit\n2. Ambil ayam dan potong daging\n3. Rebus kentang hingga empuk\n4. Rebus telur setengah matang\n5. Tuang kuah ke mangkuk, tambahkan ayam dan sayuran', 1),
(8, 'Es Teh Manis', 'Minuman segar untuk menemani santapan.', 8000, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80', 'Minuman', 'Indonesia', '[{"name": "Teh", "measure": "2 sdm"}, {"name": "Gula Pasir", "measure": "3 sdm"}, {"name": "Air Panas", "measure": "500ml"}, {"name": "Es Batu", "measure": "secukupnya"}]', '1. Seduh teh dengan air panas\n2. Tunggu teh meresap sempurna\n3. Saring dan masukkan gula pasir\n4. Biarkan teh menjadi suam-suam kuku\n5. Tuang ke gelas, tambahkan es batu', 1),
(9, 'Es Jeruk', 'Minuman jeruk segar dengan rasa asam manis.', 10000, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'Minuman', 'Indonesia', '[{"name": "Jeruk Segar", "measure": "3 buah"}, {"name": "Gula Pasir", "measure": "3 sdm"}, {"name": "Garam", "measure": "0.5 sdt"}, {"name": "Air Putih", "measure": "500ml"}, {"name": "Es Batu", "measure": "secukupnya"}]', '1. Peras jeruk segar hingga mendapat airnya\n2. Campurkan dengan gula pasir dan garam\n3. Tambahkan air putih dingin\n4. Aduk merata dan dinginkan di lemari es\n5. Tuang ke gelas dengan es batu', 1),
(10, 'Teh Tarik', 'Teh tarik khas Malaysia yang creamy dan manis.', 12000, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80', 'Minuman', 'Malaysia', '[{"name": "Teh Kuat", "measure": "3 sdm"}, {"name": "Susu Kental", "measure": "4 sdm"}, {"name": "Gula Pasir", "measure": "2 sdm"}, {"name": "Air Panas", "measure": "300ml"}, {"name": "Es Batu", "measure": "secukupnya"}]', '1. Seduh teh dengan air panas\n2. Tuang ke dalam gelas tinggi (dari ketinggian)\n3. Lakukan 2-3 kali agar teh berbusa\n4. Tambahkan susu kental dan gula\n5. Sajikan dengan es batu', 1);

-- Query untuk menampilkan menu ke frontend
SELECT id, name, description, price, image, category, area
FROM makanan
WHERE is_available = 1
ORDER BY id;

-- Query pencarian di frontend
SELECT id, name, description, price, image, category, area
FROM makanan
WHERE is_available = 1
AND (
    name LIKE '%nasi%'
    OR description LIKE '%pedas%'
    OR category LIKE '%ayam%'
)
ORDER BY name;


---- UPDATE makanan
SET image = 'https://images.unsplash.com/photo-1544145945-f90425340c7e'
WHERE id = 9;
