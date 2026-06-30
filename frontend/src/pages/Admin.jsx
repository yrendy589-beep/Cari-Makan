import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Orders from "./Orders.jsx";
import "../styles/Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("foods");
  const [pendingCount, setPendingCount] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    area: "",
    ingredients: "",
    instructions: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      alert("Anda tidak memiliki akses ke halaman ini!");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Fetch foods
  useEffect(() => {
    fetchFoods();
  }, []);

  // Polling jumlah pesanan pending untuk badge notifikasi
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/admin/orders");
        const data = await res.json();
        const pending = (data.orders || []).filter(o => o.status === "pending").length;
        setPendingCount(pending);
      } catch (err) {
        // silently fail
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/foods");
      const data = await response.json();
      setFoods(data.foods || []);
    } catch (error) {
      console.error("Error fetching foods:", error);
      alert("Gagal mengambil data makanan");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      area: "",
      ingredients: "",
      instructions: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Nama dan harga harus diisi");
      return;
    }

    try {
      if (editingId) {
        // Update food
        const response = await fetch(
          `http://localhost:4000/api/admin/foods/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error("Update gagal");
        alert("Makanan berhasil diperbarui");
      } else {
        // Add new food
        const response = await fetch("http://localhost:4000/api/admin/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Tambah gagal");
        alert("Makanan berhasil ditambahkan");
      }

      fetchFoods();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  // Handle edit
  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      description: food.description || "",
      price: food.price,
      image: food.image || "",
      category: food.category || "",
      area: food.area || "",
      ingredients: food.ingredients
        ? typeof food.ingredients === "string"
          ? food.ingredients
          : JSON.stringify(food.ingredients)
        : "",
      instructions: food.instructions || "",
    });
    setEditingId(food.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus makanan ini?")) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/foods/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete gagal");
      alert("Makanan berhasil dihapus");
      fetchFoods();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menghapus makanan");
    }
  };

  if (loading) return <div className="admin-container">Memuat...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "foods" ? "active" : ""}`}
            onClick={() => setActiveTab("foods")}
          >
            Kelola Makanan
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            style={{ position: "relative" }}
          >
            Lihat Pesanan
            {pendingCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                minWidth: "20px",
                height: "20px",
                padding: "0 5px",
                background: "#E0502B",
                color: "#fff",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse-badge 1.5s infinite",
                boxShadow: "0 0 0 0 rgba(224, 80, 43, 0.7)"
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>
        {activeTab === "foods" && (
          <button className="btn-add" onClick={() => setShowForm(true)}>
            + Tambah Makanan
          </button>
        )}
      </div>

      {/* Foods Tab */}
      {activeTab === "foods" && (
        <>
          {/* Form */}
          {showForm && (
            <div className="form-section">
              <h2>{editingId ? "Edit Makanan" : "Tambah Makanan Baru"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nama Makanan *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Nasi Goreng"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Deskripsi makanan..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Harga *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="25000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Kategori</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Contoh: Makanan Utama"
                    />
                  </div>

                  <div className="form-group">
                    <label>Area</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Contoh: Indonesia"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>URL Gambar</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Bahan-bahan</label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    placeholder="Contoh: 2 cangkir beras, 3 butir telur, 1 bawang merah, 2 siung bawang putih..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Cara Pembuatan</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Contoh: 1. Panaskan minyak di wajan... 2. Tumis bawang... 3. Masukkan beras..."
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingId ? "Simpan Perubahan" : "Tambahkan"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={resetForm}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Foods List */}
          <div className="foods-list">
            <h2>Daftar Makanan ({foods.length})</h2>
            {foods.length === 0 ? (
              <p className="no-data">Belum ada makanan</p>
            ) : (
              <table className="foods-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id}>
                      <td>{food.id}</td>
                      <td>{food.name}</td>
                      <td className="desc-cell">{food.description || "-"}</td>
                      <td>Rp {food.price.toLocaleString()}</td>
                      <td>{food.category || "-"}</td>
                      <td>{food.area || "-"}</td>
                      <td>
                        <span
                          className={
                            food.is_available
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {food.is_available ? "Tersedia" : "Tidak Tersedia"}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(food)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(food.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && <Orders />}
    </div>
  );
}
