"use client";

import { isValidUrl } from "@/utils/validate";
import Image from "next/image";

interface MenuDetails {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  price: number;
  stock: number;
  preparation_time: number;
  availability: boolean;
  category: string;
}


interface OrderItem {
    name: string;
    quantity: number;
    price_per_unit: number;
}

interface OrderDetails {
    user_id: number;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    payment_id: string;
    notes?: string;
    items: OrderItem[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    type: "menu" | "order";
    data: MenuDetails | OrderDetails | null;
}

export default function DetailsModal({
    isOpen,
    onClose,
    type,
    data,
}: Props) {
    if (!isOpen || !data) return null;

    return (
        <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {type === "menu" ? "Menu Details" : "Order Details"}
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {type === "menu" && (
                            <>
                                <Image
                                    src={
                                        (data as MenuDetails)?.image_url && isValidUrl((data as MenuDetails).image_url)
                                            ? (data as MenuDetails).image_url
                                            : "/placeholder.png"
                                    }
                                    alt={(data as MenuDetails).name}
                                    width={150}
                                    height={150}
                                    className="rounded"
                                />

                                <p><strong>ID:</strong> {(data as MenuDetails).id}</p>
                                <p><strong>Name:</strong> {(data as MenuDetails).name}</p>
                                <p><strong>Description:</strong> {(data as MenuDetails).description || ""}</p>
                                <p><strong>Price:</strong> ₹{(data as MenuDetails).price}</p>
                                <p><strong>Stock:</strong> ₹{(data as MenuDetails).stock}</p>
                                <p><strong>Preparation Time:</strong> {(data as MenuDetails).preparation_time} mins</p>
                                <p><strong>Availability:</strong> {(data as MenuDetails).availability ? "Available" : "Not Available"}</p>
                                <p><strong>Category:</strong> {(data as MenuDetails).category}</p>
                            </>
                        )}

                        {type === "order" && (
                            <>
                                <p><strong>User ID:</strong> {(data as OrderDetails).user_id}</p>
                                <p><strong>Total Amount:</strong> ₹{(data as OrderDetails).total_amount}</p>
                                <p><strong>Status:</strong> {(data as OrderDetails).status}</p>
                                <p><strong>Payment Method:</strong> {(data as OrderDetails).payment_method}</p>
                                <p><strong>Payment Status:</strong> {(data as OrderDetails).payment_status}</p>
                                <p><strong>Payment ID:</strong> {(data as OrderDetails).payment_id}</p>
                                <p><strong>Notes:</strong> {(data as OrderDetails).notes || "-"}</p>

                                <hr />

                                <h6>Ordered Items</h6>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Price Per Unit</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data as OrderDetails).items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.price_per_unit}</td>
                                                <td>₹{item.quantity * item.price_per_unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}