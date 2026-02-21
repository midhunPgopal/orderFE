"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import api from "@/lib/api";
import { Order } from "@/types";
import { useUser } from "@/context/UserContext";
import { Role } from "../../../constants";
import { ORDER_STATUS } from "@/utils/constants";
import DetailsModal from "@/components/DetailsModal";
import { socket } from "@/lib/socket";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("created_at");
    const [showDetails, setShowDetails] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const limit = 5;

    const { user } = useUser();

    const fetchOrders = async () => {
        const url = user?.role === Role.ADMIN ? "/orders/all" : "/orders/my-orders";
        const res = await api.get(url, {
            params: {
                page,
                limit,
                status,
                sort,
            },
        });

        setOrders(res.data.data);
        setTotal(res.data.total);
    };

    useEffect(() => {
        fetchOrders();
    }, [page, status, sort]);

    const fetchOrderDetails = async (id: number) => {
        const res = await api.get(`/orders/${id}`);
        setSelectedOrder(res.data);
        setShowDetails(true);
    }

    useEffect(() => {
        if (selectedId !== null) {
            fetchOrderDetails(selectedId);
        } else {
            setShowDetails(false);
            setSelectedOrder(null);
        }
    }, [selectedId]);

    const updateOrderStatus = async (id: number, status: string) => {
        await api.put(`/orders/${id}/status`, { order_status: status });
        fetchOrders();
    }

    useEffect(() => {
        socket.connect();

        // Join kitchen room to receive all order updates
        socket.emit("join-kitchen");

        // 🔥 Listen for new orders
        socket.on("new-order", () => {
            fetchOrders();
        });

        // 🔥 Listen for order payments
        socket.on("order-paid", (updatedOrder) => {
            console.log("Order paid update received:", updatedOrder);
            setOrders((prev) =>
                prev.map((order) =>
                    order.odr_id === updatedOrder.orderId
                        ? { ...order, payment_status: updatedOrder.paymentStatus, status: updatedOrder.orderStatus }
                        : order
                )
            );
        });

        // 🔥 Listen for order status updates
        socket.on("order-updated", (updatedOrder) => {
            setOrders((prev) =>
                prev.map((order) =>
                    String(order.id) === String(updatedOrder.orderId)
                        ? { ...order, status: updatedOrder.status }
                        : order
                )
            );
        });

        return () => {
            socket.off("new-order");
            socket.off("order-updated");
            socket.disconnect();
        };
    }, []);

    return (
        <div className="container mt-4">
            <h2>Orders</h2>

            {/* Search + Filter */}
            <div className="dropdown mb-2">
                <button
                    className="btn btn-outline-secondary dropdown-toggle w-50 text-start"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {status.length > 0
                        ? status.split(',').length > 1
                            ? `${status.split(',').length} statuses selected`
                            : status
                        : "Filter by status"}
                </button>

                <ul className="dropdown-menu p-2">
                    {["", ...ORDER_STATUS].map((stat) => (
                        <li key={stat} className="dropdown-item">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={stat === status}
                                    onChange={() => setStatus(stat)}
                                    id={stat}
                                />
                                <label className="form-check-label" htmlFor={stat}>
                                    {stat === "" ? "All" : stat}
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <DataTable
                columns={[
                    { key: "id", label: "ID", sortable: true },
                    { key: "status", label: "Order Status", sortable: true },
                    { key: "total_amount", label: "Total", sortable: true },
                    { key: "payment_status", label: "Payment Status", sortable: true },
                    { key: "notes", label: "Notes", sortable: true },
                    { key: "created_at", label: "Ordered At", sortable: true },
                ]}
                data={orders}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onSort={setSort}
                isAdmin={user?.role === Role.ADMIN}
                type={"order"}
                onView={(id: number) => setSelectedId(id)}
                onUpdate={async (id: number, status: string) => updateOrderStatus(id, status)}
            />
            <DetailsModal
                isOpen={showDetails}
                onClose={() => {
                    setSelectedId(null);
                    setShowDetails(false);
                }}
                type="order"
                data={selectedOrder as any}
            />
        </div>
    );
}
