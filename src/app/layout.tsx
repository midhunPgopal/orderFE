"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "../components/BootstrapClient";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token && pathname.startsWith("/auth")) {
      router.replace("/dashboard");
    } else if (!token && !pathname.startsWith("/auth")) {
      router.replace("/auth/signin");
    }
  }, [pathname, router]);
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        <UserProvider>
          <CartProvider>
            <Header />
            {children}
            <Toaster position="top-right" />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}