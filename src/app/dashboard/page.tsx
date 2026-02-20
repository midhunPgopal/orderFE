"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Role } from "../../../constants";
import CreateMenuItemModal from "@/components/CreateMenuModal";
import { useRouter } from "next/navigation";

const Dashboard: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleRoute = (path: string) => {
        router.push(path);
    }
    return (
        <>
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <div className="card shadow h-100">
                            <div className="card-body text-center">
                                <h4>Orders</h4>
                                <p>{user?.role === Role.USER ? "See your orders" : "Manage orders"}</p>
                                <button className="btn btn-primary" onClick={() => handleRoute("/orders")}>
                                    Orders
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card shadow h-100">
                            <div className="card-body text-center">
                                <h4>Menu</h4>
                                <p>{user?.role === Role.USER ? "View available menu items" : "Manage menu items"}</p>
                                <button className="btn btn-success" onClick={() => handleRoute("/menu")}>
                                    Menu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {user?.role === Role.ADMIN && (
                    <div className="row">
                        <div className="col-md-12 mb-12">
                            <div className="card-body text-center">
                                <button className="btn btn-warning" onClick={() => setOpen(!open)}>
                                    Add a New Menu Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <CreateMenuItemModal
                show={open}
                menuItem={null}
                handleClose={() => setOpen(false)}
                onSuccess={() => router.refresh()}
            />
        </>
    );
};

export default Dashboard;