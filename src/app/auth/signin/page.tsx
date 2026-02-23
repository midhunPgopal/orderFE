"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useUser } from "@/context/UserContext"; // import your context

const Login: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser(); // setUser from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/signin", { email, password });

      const { accessToken, user } = res.data;

      // Save access token in localStorage
      localStorage.setItem("accessToken", accessToken);

      // Save user info in localStorage and context
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); // update context

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>

            <div className="text-center mt-3">
              <span>Doesn't have an account? </span>
              <button
                className="btn btn-link p-0"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
