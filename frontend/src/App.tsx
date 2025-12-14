import { useCart } from "./contexts/CartContext";
import { CartProvider } from "./contexts/CartContext";
import type { ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

// Navbar Component
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/" className="nav-logo">🍬 Sweet Shop</a>
        
        <div className="nav-links">
          {isAuthenticated && (
            <>
              <a href="/orders" className="nav-link">My Orders</a>
              <a href="/cart" className="cart-link">
                🛒 Cart ({getTotalItems()})
              </a>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              <span className="nav-user">Welcome, {user?.name}!</span>
              {user?.role === 'ADMIN' && <span className="admin-badge">ADMIN</span>}
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-link">Login</a>
              <a href="/register" className="nav-link">Register</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Main App Component
const AppContent = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
