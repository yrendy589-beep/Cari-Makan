import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Update gagal");
      alert("Status pesanan berhasil diupdate");
      fetchOrders();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengupdate status");
    }
  };

  if (loading) return <div className="p-8">Memuat pesanan...</div>;

  return (
    <div className="orders-section">
      <h2>Daftar Pesanan ({orders.length})</h2>

      {orders.length === 0 ? (
        <p className="no-data">Belum ada pesanan</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Pesanan #{order.id}</h3>
                  <p className="customer">
                    {order.user_name} ({order.user_email})
                  </p>
                  <p className="date">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="order-meta">
                  <div className="total">
                    <p>Total</p>
                    <p className="amount">
                      Rp {order.total_price.toLocaleString()}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`status-select status-${order.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Tervalidasi / Selesai</option>
                    <option value="cancelled">Batal</option>
                  </select>
                  <button
                    onClick={() => {
                      // Buka window baru untuk print sederhana
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Struk Pesanan #${order.id}</title>
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
                              
                              body {
                                font-family: 'Plus Jakarta Sans', sans-serif;
                                background-color: #FBF6EF; /* Cream */
                                color: #241F1A;
                                margin: 0;
                                padding: 40px 20px;
                                display: flex;
                                justify-content: center;
                              }
                              
                              .receipt {
                                width: 100%;
                                max-width: 450px;
                                background: #FFFDF8;
                                border-radius: 24px 24px 0 0;
                                box-shadow: 0 25px 50px rgba(0,0,0,0.15);
                                position: relative;
                              }
                              
                              .header {
                                background-color: #1F3A2E; /* Leaf */
                                padding: 40px 30px;
                                text-align: center;
                                color: #FFFDF8;
                                border-radius: 24px 24px 0 0;
                              }
                              
                              .icon {
                                width: 48px;
                                height: 48px;
                                background-color: rgba(251, 246, 239, 0.1);
                                border-radius: 50%;
                                margin: 0 auto 16px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #E8A53D; /* Gold */
                              }
                              
                              .subtitle {
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 12px;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                color: rgba(232, 165, 61, 0.8);
                                margin-bottom: 12px;
                              }
                              
                              .title {
                                font-family: 'Fraunces', serif;
                                font-size: 32px;
                                font-weight: 700;
                                margin: 0;
                              }

                              .badge {
                                display: inline-flex;
                                align-items: center;
                                background-color: rgba(232, 165, 61, 0.2);
                                border: 1px solid rgba(232, 165, 61, 0.5);
                                color: #F2C572;
                                padding: 6px 16px;
                                border-radius: 9999px;
                                font-size: 14px;
                                font-weight: 700;
                                margin-top: 24px;
                              }

                              .badge-dot {
                                width: 10px;
                                height: 10px;
                                background-color: #E8A53D;
                                border-radius: 50%;
                                margin-right: 8px;
                              }

                              .ticket-edge {
                                background-image: radial-gradient(circle at 50% 50%, #FFFDF8 4px, transparent 4.5px);
                                background-size: 18px 9px;
                                background-repeat: repeat-x;
                                background-position: top;
                                height: 9px;
                                margin-top: -1px;
                                background-color: #1F3A2E;
                              }

                              .body-content {
                                padding: 30px 30px 40px;
                              }

                              .meta {
                                display: flex;
                                justify-content: space-between;
                                border-bottom: 2px dashed #E5DCC9;
                                padding-bottom: 24px;
                                margin-bottom: 24px;
                              }

                              .meta-label {
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 11px;
                                color: rgba(36, 31, 26, 0.5);
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin: 0 0 6px 0;
                              }

                              .meta-value {
                                font-weight: 600;
                                font-size: 15px;
                                margin: 0;
                              }
                              
                              .meta-right {
                                text-align: right;
                              }

                              .items-label {
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 11px;
                                color: rgba(36, 31, 26, 0.5);
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin: 0 0 16px 0;
                              }

                              .item {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 16px;
                              }

                              .item-left {
                                display: flex;
                                gap: 12px;
                              }

                              .item-qty {
                                font-family: 'JetBrains Mono', monospace;
                                font-weight: 700;
                                font-size: 14px;
                                color: #1F3A2E;
                              }

                              .item-name {
                                font-family: 'Fraunces', serif;
                                font-size: 16px;
                                font-weight: 600;
                              }

                              .item-price {
                                font-family: 'JetBrains Mono', monospace;
                                font-weight: 600;
                                font-size: 14px;
                              }

                              .total-section {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                border-top: 2px dashed #E5DCC9;
                                padding-top: 24px;
                                margin-top: 8px;
                              }

                              .total-label {
                                font-weight: 700;
                                font-size: 16px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                              }

                              .total-amount {
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 24px;
                                font-weight: 700;
                                color: #E0502B; /* Chili */
                              }

                              .ticket-edge-bottom {
                                background-image: radial-gradient(circle at 50% 50%, #FBF6EF 4px, transparent 4.5px);
                                background-size: 18px 9px;
                                background-repeat: repeat-x;
                                background-position: top;
                                height: 9px;
                                background-color: #FFFDF8;
                              }

                              @media print {
                                body {
                                  background-color: #FFFDF8;
                                  padding: 0;
                                }
                                .receipt {
                                  box-shadow: none;
                                  max-width: 100%;
                                  border-radius: 0;
                                }
                                .header { border-radius: 0; }
                                .ticket-edge-bottom { display: none; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="receipt">
                              <div class="header">
                                <div class="icon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                                    <path d="M3 6h18"></path>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                  </svg>
                                </div>
                                <div class="subtitle">STRUK PESANAN</div>
                                <h1 class="title">Terima Kasih!</h1>
                                <div class="badge">
                                  <div class="badge-dot"></div>
                                  Menunggu Validasi Admin...
                                </div>
                              </div>
                              
                              <div class="ticket-edge"></div>
                              
                              <div class="body-content">
                                <div class="meta">
                                  <div>
                                    <p class="meta-label">Nomor Pesanan</p>
                                    <p class="meta-value">#${order.id}</p>
                                  </div>
                                  <div class="meta-right">
                                    <p class="meta-label">Tanggal</p>
                                    <p class="meta-value">${new Date(order.created_at).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                  </div>
                                </div>

                                <p class="items-label">Detail Pesanan</p>
                                <div class="items">
                                  ${order.items.map(i => `
                                    <div class="item">
                                      <div class="item-left">
                                        <span class="item-qty">${i.qty}x</span>
                                        <span class="item-name">${i.food_name}</span>
                                      </div>
                                      <span class="item-price">Rp ${(i.price * i.qty).toLocaleString()}</span>
                                    </div>
                                  `).join('')}
                                </div>

                                <div class="total-section">
                                  <span class="total-label">Total Bayar</span>
                                  <span class="total-amount">Rp ${order.total_price.toLocaleString()}</span>
                                </div>
                              </div>
                              <div class="ticket-edge-bottom"></div>
                            </div>
                            
                            <script>
                              window.onload = () => {
                                setTimeout(() => window.print(), 500);
                              };
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="btn-print"
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#e8a53d",
                      color: "#241f1a",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      marginLeft: "10px"
                    }}
                  >
                    Cetak Struk
                  </button>
                </div>
              </div>

              <div className="order-items">
                <h4>Item Pesanan:</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <span>{item.food_name}</span>
                    <span>
                      {item.qty} x Rp {item.price.toLocaleString()}
                    </span>
                    <span className="subtotal">
                      Rp {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="order-notes">
                  <p>
                    <strong>Catatan:</strong> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
