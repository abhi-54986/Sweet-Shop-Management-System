import { useState, useEffect } from "react";
import { sweetAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import type { Sweet } from "../types/types";

const Home = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    try {
      const response = await sweetAPI.getAll();
      setSweets(response.data.sweets);
    } catch (error) {
      console.error("Error loading sweets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (sweet: Sweet) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }

    addToCart(sweet);
    alert(`${sweet.name} added to cart!`);
  };

  if (loading) {
    return <div className="container">Loading sweets...</div>;
  }

  return (
    <div
      className="container"
      style={{
        maxWidth: "100%",
        width: "100%",
        margin: 0,
        padding: "2rem 3rem",
      }}
    >
      <h1>Sweet Shop</h1>
      <p>Welcome to our Sweet Shop! Browse our delicious collection.</p>

      <div className="sweets-grid">
        {sweets.length === 0 ? (
          <p>No sweets available at the moment.</p>
        ) : (
          sweets.map((sweet) => (
            <div key={sweet._id} className="sweet-card">
              {sweet.imageUrl && (
                <img
                  src={sweet.imageUrl}
                  alt={sweet.name}
                  className="sweet-image"
                />
              )}
              <h3>{sweet.name}</h3>
              <p>{sweet.description}</p>
              <p className="price">₹{sweet.price}</p>
              <p className="stock">Stock: {sweet.stock}</p>
              <button onClick={() => handleAddToCart(sweet)}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
