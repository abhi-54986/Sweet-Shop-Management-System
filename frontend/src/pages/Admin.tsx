import { useState, useEffect } from "react";
import { sweetAPI, orderAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Sweet, Order } from "../types/types";

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "sweets">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSweet, setShowAddSweet] = useState(false);
  const [newSweet, setNewSweet] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    } else {
      loadSweets();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSweets = async () => {
    setLoading(true);
    try {
      const response = await sweetAPI.getAll();
      setSweets(response.data.sweets);
    } catch (error) {
      console.error("Error loading sweets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      alert("Order status updated successfully!");
      loadOrders();
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  const handleAddSweet = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sweetAPI.create(newSweet);
      alert("Sweet added successfully!");
      setShowAddSweet(false);
      setNewSweet({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        imageUrl: "",
      });
      setSelectedImage(null);
      setImagePreview("");
      loadSweets();
    } catch (error) {
      console.error("Error adding sweet:", error);
      alert("Failed to add sweet");
    }
  };

  const handleDeleteSweet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;

    try {
      await sweetAPI.delete(id);
      alert("Sweet deleted successfully!");
      loadSweets();
    } catch (error) {
      alert("Failed to delete sweet");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserName = (orderUser: Order['user']) => {
    if (!orderUser) return "Unknown";
    if (typeof orderUser === "object" && orderUser.name) {
      return orderUser.name;
    }
    return "Unknown";
  };

  const getSweetName = (sweet: any) => {
    if (!sweet) return "Unknown Sweet";
    if (typeof sweet === "object" && sweet.name) {
      return sweet.name;
    }
    return "Sweet";
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders Management
        </button>
        <button
          className={`tab-button ${activeTab === "sweets" ? "active" : ""}`}
          onClick={() => setActiveTab("sweets")}
        >
          Sweets Management
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === "orders" && (
            <div className="admin-orders">
              <h2>All Orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div className="admin-orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="admin-order-card">
                      <div className="admin-order-header">
                        <div>
                          <h3>Order #{order._id.slice(-6)}</h3>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p>Customer: {getUserName(order.user)}</p>
                        </div>
                        <div>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order._id, e.target.value)
                            }
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="admin-order-item">
                            <span>
                              {getSweetName(item.sweet)} × {item.quantity}
                            </span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="admin-order-footer">
                        <div className="order-address-short">
                          📍 {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.state}
                        </div>
                        <div className="admin-order-total">
                          Total: ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sweets" && (
            <div className="admin-sweets">
              <div className="admin-sweets-header">
                <h2>All Sweets ({sweets.length})</h2>
                <button
                  onClick={() => setShowAddSweet(!showAddSweet)}
                  className="add-sweet-button"
                >
                  {showAddSweet ? "Cancel" : "+ Add New Sweet"}
                </button>
              </div>

              {showAddSweet && (
                <form onSubmit={handleAddSweet} className="add-sweet-form">
                  <h3>Add New Sweet</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={newSweet.name}
                        onChange={(e) =>
                          setNewSweet({ ...newSweet, name: e.target.value })
                        }
                        required
                        placeholder="e.g., Gulab Jamun"
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <input
                        type="text"
                        value={newSweet.category}
                        onChange={(e) =>
                          setNewSweet({ ...newSweet, category: e.target.value })
                        }
                        required
                        placeholder="e.g., Traditional"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={newSweet.description}
                      onChange={(e) =>
                        setNewSweet({
                          ...newSweet,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={3}
                      placeholder="Describe the sweet..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        value={newSweet.price}
                        onChange={(e) =>
                          setNewSweet({
                            ...newSweet,
                            price: Number(e.target.value),
                          })
                        }
                        required
                        min="0"
                        placeholder="250"
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock *</label>
                      <input
                        type="number"
                        value={newSweet.stock}
                        onChange={(e) =>
                          setNewSweet({
                            ...newSweet,
                            stock: Number(e.target.value),
                          })
                        }
                        required
                        min="0"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL (optional)</label>
                    <input
                      type="text"
                      value={newSweet.imageUrl}
                      onChange={(e) =>
                        setNewSweet({ ...newSweet, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <button type="submit" className="submit-sweet-button">
                    Add Sweet
                  </button>
                </form>
              )}

              <div className="admin-sweets-grid">
                {sweets.map((sweet) => (
                  <div key={sweet._id} className="admin-sweet-card">
                    {sweet.imageUrl && (
                      <img
                        src={sweet.imageUrl}
                        alt={sweet.name}
                        className="admin-sweet-image"
                      />
                    )}
                    <h3>{sweet.name}</h3>
                    <p className="sweet-category">{sweet.category}</p>
                    <p className="sweet-description">{sweet.description}</p>
                    <div className="sweet-details">
                      <span className="sweet-price">₹{sweet.price}</span>
                      <span className="sweet-stock">Stock: {sweet.stock}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSweet(sweet._id)}
                      className="delete-sweet-button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;