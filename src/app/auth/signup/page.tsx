"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const Signup: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^\d{7,15}$/;

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.phone.trim())
      newErrors.phone = "Phone is required";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Phone must contain 7–15 digits only";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role)
      newErrors.role = "Role is required";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      await api.post("/auth/signup", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      router.push("/auth/signin");
    } catch (err: any) {
      setErrors({
        api: err.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Sign Up</h3>

              {errors.api && (
                <div className="alert alert-danger">{errors.api}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className={`form-control ${
                        errors.firstName ? "is-invalid" : ""
                      }`}
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.firstName}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className={`form-control ${
                        errors.lastName ? "is-invalid" : ""
                      }`}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.lastName}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone (without country code)
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    name="role"
                    id="role"
                    className={`form-select ${
                      errors.role ? "is-invalid" : ""
                    }`}
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <div className="invalid-feedback">{errors.role}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.password}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>

              <div className="text-center mt-3">
                <span>Already have an account? </span>
                <button
                  className="btn btn-link p-0"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;