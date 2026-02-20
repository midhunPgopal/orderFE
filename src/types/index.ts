export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string; // CSV
    availability: boolean | number;
    description?: string;
    image_url?: string;
    preparation_time: number;
    created_at: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    id: number;
    user_id: number;
    total_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
}
