"use client";

import { useCart } from "@/context/CartContext";
import PaymentButton from "@/components/PaymentButton";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/debouncs";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function CartPage() {
  const { cart, clearCart, addToCart, reduceQuantity } = useCart();
  const [notes, setNotes] = useState("");
  const [show, setShow] = useState(false);
  const debouncedNotes = useDebounce(notes, 500);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateCart = async () => {
    const res = await api.post("/orders/validateCart", { cart });
    if (res.data.valid) {
      setShow(true);
    } else {
      toast.error("Please review your cart. Some item(s) price(s) are changed or out of stock.");
    }
  }

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">🛒 Your Cart</h3>
            {cart.length > 0 && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center text-muted py-4">
              <h5>Your cart is empty</h5>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>

                        <td className="text-center">
                          ₹ {item.price}
                        </td>

                        <td className="text-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => reduceQuantity(String(item.id))}
                            >
                              -
                            </button>
                            <button
                              className="btn btn-light btn-sm"
                              disabled
                            >
                              {item.quantity}
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="text-end">
                          ₹ {item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr />
              <div className="mb-3">
                <label htmlFor="specialInstructions" className="form-label">
                  Special Instructions
                </label>
                <textarea
                  id="specialInstructions"
                  className="form-control"
                  placeholder="Add any special instructions for your order..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              <hr />

              <div className="d-flex justify-content-between align-items-center">
                <h4>Total: ₹ {total}</h4>
                {!show ? <button className="btn btn-primary" onClick={validateCart}>Proceed to Pay</button> :
                  <PaymentButton amount={total} notes={debouncedNotes} />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}