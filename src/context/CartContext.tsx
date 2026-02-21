"use client";

import { CartItem } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  reduceQuantity: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    if (item.stock < 1) {
      toast.error("Item is out of stock");
      return;
    } else if (String(item.availability) === "No") {
      toast.error("Item is currently unavailable");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (item.quantity > item.stock) {
        toast.error("Cannot add more than available stock");
        return prev;
      }
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };


  const reduceQuantity = (id: string) => {
    const exists = cart.find(item => String(item.id) === id);

    if (!exists) {
      toast.error("Item not found in cart");
      return;
    }

    setCart((prev) =>
      prev
        .map((item) =>
          String(item.id) === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    toast.success("Item quantity updated");
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  //logic to persist cart in localStorage
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  if (!isLoaded) return null;

  return (
    <CartContext.Provider value={{ cart, addToCart, reduceQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be inside CartProvider");
  return context;
};
