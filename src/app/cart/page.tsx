"use client";

import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, clearCart, addToCart, reduceQuantity } = useCart();
  const router = useRouter();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const res = await api.post("/orders", { items: cart });
    clearCart();
    router.push(`/orders/${res.data.orderId}`);
  };

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

              <div className="d-flex justify-content-between align-items-center">
                <h4>Total: ₹ {total}</h4>
                <button
                  className="btn btn-success"
                  onClick={placeOrder}
                >
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}