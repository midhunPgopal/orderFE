"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.replace("/dashboard"); // logged in → dashboard
    } else {
      router.replace("/auth/signin"); // not logged in → signin
    }
  }, [router]);

  // Optionally, show a loading state while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h3>Redirecting...</h3>
    </div>
  );
}