"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface Order {
  id: string;
  status: string;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    socket.connect();
    socket.emit("join-kitchen");

    socket.on("new-order", (order) => {
      setOrders((prev) => [...prev, order]);
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="container mt-5">
      <h2>Kitchen Dashboard</h2>

      <div className="row mt-4">
        {orders.map((order) => (
          <div className="col-md-4 mb-3" key={order.id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h5>Order #{order.id}</h5>
                <p>Status: {order.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}