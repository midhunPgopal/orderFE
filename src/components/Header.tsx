"use client";

import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Role } from "../../constants";

const Header: React.FC = () => {
  const { user, logout } = useUser();
  const { cart } = useCart();

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      {user && (
        <>
          <Link href="/dashboard" className="navbar-brand">
            <span className="navbar-brand" >
              Welcome, {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
            </span>
          </Link>
          <Link href="/orders" className="navbar-brand">
            <span className="navbar-brand" >
              Orders
            </span>
          </Link>
          {user.role === Role.USER &&
            <Link href="/cart" className="navbar-brand">
              <span className="navbar-brand" >
                Cart ({cart.length || 0})
              </span>
            </Link>
          }
          <Link href="/menu" className="navbar-brand">
            <span className="navbar-brand" >
              Menu
            </span>
          </Link>
          <button className="btn btn-outline-light" onClick={logout}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Header;
