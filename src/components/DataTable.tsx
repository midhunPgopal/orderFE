"use client";

import { useCart } from "@/context/CartContext";
import { ORDER_STATUS } from "@/utils/constants";

interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}

interface Props<T> {
    columns: Column<T>[];
    data: T[];
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onSort: (key: string) => void;
    isAdmin: boolean;
    type: "menu" | "order";
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
    onView?: (id: number) => void;
    onUpdate?: (id: number, status: string) => void;
}

export default function DataTable<T extends { id: number }>({
    columns,
    data,
    total,
    page,
    limit,
    onPageChange,
    onSort,
    isAdmin,
    type,
    onDelete,
    onEdit,
    onView,
    onUpdate
}: Props<T>) {
    const totalPages = Math.ceil(total / limit);
    const { cart, addToCart, reduceQuantity } = useCart();

    return (
        <div className="card p-3 shadow-sm">
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Sl No</th>
                        {columns
                            .filter((col) => {
                                if (col.key === "id" && !isAdmin) {
                                    return false;
                                }
                                return true;
                            })
                            .map((col) => (
                                <th
                                    key={String(col.key)}
                                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                                    onClick={() => col.sortable && onSort(String(col.key))}
                                >
                                    {col.label} {col.sortable && "↕"}
                                </th>
                            ))}
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, index) => (
                        <tr key={row.id}>
                            <td>{(page - 1) * limit + index + 1}</td>
                            {columns
                                .filter((col) => {
                                    if (col.key === "id" && !isAdmin) {
                                        return false;
                                    }
                                    return true;
                                })
                                .map((col) => (
                                    <td key={String(col.key)}>
                                        {col.render ? col.render(row) : String(row[col.key])}
                                    </td>
                                ))}

                            {/* Menu action Buttons */}
                            {!isAdmin ?
                                <td>
                                    {type === "menu" && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-danger me-2"
                                                onClick={() => reduceQuantity?.(String(row.id))}
                                            >
                                                -
                                            </button>
                                            {cart.filter(item => String(item.id) === String(row.id))[0]?.quantity || 0}
                                            <button
                                                className="btn btn-sm btn-warning ms-2"
                                                onClick={() => addToCart?.({
                                                    quantity: 1,
                                                    id: Number(row.id),
                                                    stock: Number((row as any).stock) || 0,
                                                    price: Number((row as any).price) || 0,
                                                    name: (row as any).name || "",
                                                    category: (row as any).category || "",
                                                    availability: (row as any).availability,
                                                    preparation_time: (row as any).preparation_time || 0,
                                                    created_at: (row as any).created_at || ""
                                                })}
                                            >
                                                +
                                            </button>
                                        </>
                                    )}
                                    {type === "order" && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => onView?.(row.id)}
                                            >
                                                View Order
                                            </button>
                                        </>

                                    )}
                                </td> :
                                <td>
                                    {type === "menu" && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => onEdit?.(row.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onDelete?.(row.id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {type === "order" && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => onView?.(row.id)}
                                            >
                                                View Order
                                            </button>
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-primary dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    {(row as any).status}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {ORDER_STATUS.map((s) => (
                                                        <li key={s}>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => onUpdate?.(row.id, s)}
                                                                disabled={s === (row as any).status} // optional: disable current status
                                                            >
                                                                {s}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </td>
                            }
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-outline-primary"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Prev
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    className="btn btn-outline-primary"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}