"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MenuItem } from "@/types";
import Image from "next/image";
import { isValidUrl } from "@/utils/validate";
import { CATEGORY_OPTIONS } from "@/utils/constants";

interface Props {
    show: boolean;
    menuItem?: MenuItem | null;
    handleClose: () => void;
    onSuccess: () => void;
}

export default function CreateMenuItemModal({
    show,
    menuItem,
    handleClose,
    onSuccess
}: Props) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image_url: "",
        price: "",
        stock: "",
        preparation_time: "",
        availability: true,
        categories: [] as string[]
    });

    useEffect(() => {
        if (menuItem) {
            setFormData({
                name: menuItem.name,
                description: menuItem.description || "",
                image_url: menuItem.image_url || "",
                price: menuItem.price.toString(),
                stock: menuItem.stock.toString(),
                preparation_time: menuItem.preparation_time.toString(),
                availability: menuItem.availability === 1,
                categories: menuItem.category?.split(",") || [],
            });
        }
    }, [menuItem]);
    
    useEffect(() => {
        if (!show) {
            setFormData({
                name: "",
                description: "",
                image_url: "",
                price: "",
                stock: "",
                preparation_time: "",
                availability: true,
                categories: []
            });
        }
    }, [show]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            setFormData({
                ...formData,
                availability: (e.target as HTMLInputElement).checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, categories: selected });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            preparation_time: parseInt(formData.preparation_time),
            availability: formData.availability ? 1 : 0,
            category: formData.categories.join(",") // CSV conversion
        };

        try {
            setLoading(true);

            const promise = menuItem ?
                api.put(`/menu/${menuItem.id}`, payload) :
                api.post("/menu/create", payload);
            const notification = {
                loading: menuItem ? "Updating menu item..." : "Creating menu item...",
                success: menuItem ? "Menu item updated successfully 🎉" : "Menu item created successfully 🎉",
                error: menuItem ? "Failed to update menu item" : "Failed to create menu item"
            }
            await toast.promise(promise, notification);
            handleClose();
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">{menuItem ? "Edit Menu Item" : "Create Menu Item"}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                            ></button>
                        </div>
                        <div className="p-3">
                            {menuItem && <Image
                                src={
                                    menuItem?.image_url && isValidUrl(menuItem.image_url)
                                        ? menuItem.image_url
                                        : "/placeholder.png"
                                }
                                alt={menuItem.name}
                                width={150}
                                height={150}
                                className="rounded"
                            />
                            }
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            className="form-control"
                                            required
                                            value={formData.stock}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Preparation Time (mins)
                                    </label>
                                    <input
                                        type="number"
                                        name="preparation_time"
                                        className="form-control"
                                        required
                                        value={formData.preparation_time}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Image URL</label>
                                    <input
                                        type="text"
                                        name="image_url"
                                        className="form-control"
                                        required
                                        value={formData.image_url}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="price"
                                            className="form-control"
                                            required
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Preparation Time (mins)
                                        </label>
                                        <input
                                            type="number"
                                            name="preparation_time"
                                            className="form-control"
                                            required
                                            value={formData.preparation_time}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-check form-switch mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={formData.availability}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label">
                                        Available
                                    </label>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Categories</label>
                                    <select
                                        multiple
                                        className="form-select"
                                        onChange={handleCategoryChange}
                                    >
                                        {CATEGORY_OPTIONS.map((cat: string) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Hold Ctrl (Windows) / Cmd (Mac) to select multiple
                                    </small>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (menuItem ? "Updating..." : "Creating...") : menuItem ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div >
            </div >

            {/* Backdrop */}
            < div className="modal-backdrop fade show" ></div >
        </>
    );
}
