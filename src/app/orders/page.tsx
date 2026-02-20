"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import api from "@/lib/api";
import { Order } from "@/types";
import { useUser } from "@/context/UserContext";
import { Role } from "../../../constants";
import { ORDER_STATUS } from "@/utils/constants";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("created_at");

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

                <ul className="dropdown-menu w-50 p-2">
                    {ORDER_STATUS.map((stat) => (
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
                                    {stat}
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <DataTable
                columns={[
                    { key: "id", label: "ID", sortable: true },
                    { key: "status", label: "Status", sortable: true },
                    { key: "total_amount", label: "Total", sortable: true },
                    { key: "created_at", label: "Created", sortable: true },
                ]}
                data={orders}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onSort={setSort}
                isAdmin={user?.role === Role.ADMIN}
                type={"menu"}
                onDelete={() => { }}
                onEdit={() => { }}
                onUpdate={() => { }}
            />
        </div>
    );
}
