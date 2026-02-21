"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import api from "@/lib/api";
import { MenuItem } from "@/types";
import CreateMenuItemModal from "@/components/CreateMenuModal";
import { useUser } from "@/context/UserContext";
import { Role } from "../../../constants";
import toast from "react-hot-toast";
import DetailsModal from "@/components/DetailsModal";
import { CATEGORY_OPTIONS } from "@/utils/constants";
import { useDebounce } from "@/hooks/debouncs";

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("created_at");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showDeatils, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Number.MAX_SAFE_INTEGER);

  const limit = 5;
  const { user } = useUser();

  const fetchMenu = async () => {
    const res = await api.get("/menu", {
      params: {
        page,
        limit,
        search,
        category,
        sort,
        minPrice,
        maxPrice,
      },
    });

    const updatedMenu = res.data.data.map((item: MenuItem) => ({
      ...item,
      availability: Number(item.availability) === 1 ? "Yes" : "No",
    }));
    setMenu(updatedMenu);
    setTotal(res.data.total);
  };

  const debouncedSearch = useDebounce(search, 1000);

  useEffect(() => {
    if (maxPrice < 1) setMaxPrice(Number.MAX_SAFE_INTEGER);
    fetchMenu();
  }, [page, debouncedSearch, category, sort, minPrice, maxPrice]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/menu/${id}`);

      toast.success("Menu item deleted successfully");

      // 🔥 Handle pagination edge case
      if (menu.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchMenu();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete menu item"
      );
    }
  }

  const toggleCategory = (value: string) => {
    setCategory((prev) =>
      prev.includes(value)
        ? prev.split(',').filter((c) => c !== value).join(',')
        : `${prev},${value}`.replace(/^,/, '')
    );
  };

  return (
    <div className="container mt-4">
      <h2>Menu Items</h2>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          className="form-control"
          placeholder="Min Price"
          type="number"
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />

        <input
          className="form-control"
          placeholder="Max Price"
          type="number"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />

        <div className="dropdown">
          <button
            className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {category.length > 0
              ? category.split(',').length > 1
                ? `${category.split(',').length} categories selected`
                : category
              : "Filter by category"}
          </button>

          <ul className="dropdown-menu w-100 p-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <li key={cat} className="dropdown-item">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={category.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    id={cat}
                  />
                  <label className="form-check-label" htmlFor={cat}>
                    {cat}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID", sortable: true },
          {
            key: "name",
            label: "Name",
            sortable: true,
            render: (row) => (
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setSelectedItem(row);
                  setShowDetails(true);
                }}
              >
                {row.name}
              </span>
            ),
          },
          { key: "price", label: "Price", sortable: true },
          { key: "stock", label: "Stock", sortable: true },
          { key: "category", label: "Category" },
          { key: "availability", label: "Available", sortable: true },
        ]}
        data={menu}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onSort={setSort}
        isAdmin={user?.role === Role.ADMIN}
        type={"menu"}
        onDelete={handleDelete}
        onEdit={(id) => {
          setSelectedItem(menu.find((item) => item.id === id) || null);
          setShowModal(true);
        }}
      />
      <CreateMenuItemModal
        show={showModal}
        menuItem={selectedItem}
        handleClose={() => {
          setSelectedItem(null);
          setShowModal(false);
        }}
        onSuccess={fetchMenu}
      />
      <DetailsModal
        isOpen={showDeatils}
        onClose={() => {
          setSelectedItem(null);
          setShowDetails(false);
        }}
        type="menu"
        data={
          selectedItem
            ? ({ ...selectedItem, image_url: selectedItem.image_url ?? "/placeholder.png" } as any)
            : null
        }
      />
    </div>
  );
}
