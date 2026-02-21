"use client";

import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast/headless";

export default function RazorpayButton({amount, notes}: {amount: number, notes?: string}) {
    const [loading, setLoading] = useState(false);
    const { clearCart, cart } = useCart();
    const router = useRouter();

    const loadScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
            alert("Razorpay SDK failed to load");
            return;
        }

        // 1️⃣ Create order from backend
        const { data: order } = await api.post("/orders/create-order", { amount, cart, notes });

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            name: "MIdhun",
            description: "Test Payment",
            order_id: order.id,

            handler: async function (response: any) {
                const {data: result} = await api.post("/orders/verify-payment", { orderId: order.id, paymentResult: response });

                if (result.success) {
                    toast.success("Payment Successful!");
                    clearCart(); // Clear cart after successful payment
                    router.push("/orders");
                } else {
                    toast.error("Payment Verification Failed");
                }
            },

            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

        setLoading(false);
    };

    return (
        <button className="btn btn-primary" onClick={handlePayment}>
            {loading ? "Processing..." : `Place Order`}
        </button>
    );
}