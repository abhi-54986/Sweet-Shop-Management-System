import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI } from '../services/api';
import type { DeliveryAddress } from '../types/types';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalAmount } = useCart();
  const navigate = useNavigate();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          sweet: item.sweet._id,
          quantity: item.quantity,
        })),
        deliveryAddress: address,
      };

      await orderAPI.create(orderData);
      alert('Order placed successfully! 🎉');
      clearCart();
      navigate('/orders');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="container">
        <h1>Checkout</h1>
        <button onClick={() => setShowCheckout(false)} className="back-button">
          ← Back to Cart
        </button>

        <div className="checkout-container">
          <div className="order-summary">
            <h2>Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.sweet._id} className="summary-item">
                <span>{item.sweet.name} × {item.quantity}</span>
                <span>₹{item.sweet.price * item.quantity}</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total:</strong>
              <strong>₹{getTotalAmount()}</strong>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <h2>Delivery Address</h2>
            
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                  placeholder="Mumbai"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  required
                  placeholder="400001"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                  placeholder="9876543210"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="place-order-button">
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.sweet._id} className="cart-item">
            <div className="cart-item-info">
              <h3>{item.sweet.name}</h3>
              <p className="cart-item-price">₹{item.sweet.price}</p>
            </div>

            <div className="cart-item-actions">
              <div className="quantity-control">
                <button
                  onClick={() => updateQuantity(item.sweet._id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.sweet._id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                ₹{item.sweet.price * item.quantity}
              </div>

              <button
                onClick={() => removeFromCart(item.sweet._id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <h2>Total: ₹{getTotalAmount()}</h2>
        </div>
        <button onClick={handleCheckout} className="checkout-button">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;