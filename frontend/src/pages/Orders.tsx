import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import type { Order } from '../types/types';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1>My Orders</h1>
        <p>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order._id.slice(-6)}</h3>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>
                    {typeof item.sweet === 'object' ? item.sweet.name : 'Sweet'} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-address">
                <strong>Delivery Address:</strong>
                <p>
                  {order.deliveryAddress.street}, {order.deliveryAddress.city},
                  {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                </p>
                <p>Phone: {order.deliveryAddress.phone}</p>
              </div>
              <div className="order-total">
                <strong>Total: ₹{order.totalAmount}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;