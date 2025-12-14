import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Sweet } from '../types/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (sweet: Sweet) => void;
  removeFromCart: (sweetId: string) => void;
  updateQuantity: (sweetId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (sweet: Sweet) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.sweet._id === sweet._id);

      if (existingItem) {
        // Increase quantity if item already in cart
        return prev.map((item) =>
          item.sweet._id === sweet._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prev, { sweet, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (sweetId: string) => {
    setCartItems((prev) => prev.filter((item) => item.sweet._id !== sweetId));
  };

  const updateQuantity = (sweetId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sweetId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.sweet._id === sweetId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.sweet.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};