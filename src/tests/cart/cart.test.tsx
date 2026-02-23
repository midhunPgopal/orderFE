import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartPage from "@/app/cart/page";
import api from "@/lib/api";
import toast from "react-hot-toast";

const mockClearCart = jest.fn();
const mockAddToCart = jest.fn();
const mockReduceQuantity = jest.fn();

jest.mock("@/context/CartContext", () => ({
  useCart: () => ({
    cart: [],
    clearCart: mockClearCart,
    addToCart: mockAddToCart,
    reduceQuantity: mockReduceQuantity,
  }),
}));

jest.mock("@/hooks/debouncs", () => ({
  useDebounce: (value: string) => value,
}));

jest.mock("@/components/PaymentButton", () => ({
  __esModule: true,
  default: ({ amount }: any) => (
    <div data-testid="payment-button">Payment: {amount}</div>
  ),
}));

jest.mock("@/lib/api");
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows empty cart message", () => {
    render(<CartPage />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders cart items correctly", () => {
    const cartItems = [
      { id: 1, name: "Pizza", price: 100, quantity: 2 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    render(<CartPage />);

    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("₹ 200")).toBeInTheDocument(); // subtotal
    expect(screen.getByText("Total: ₹ 200")).toBeInTheDocument();
  });

  it("calls clearCart when button clicked", () => {
    const cartItems = [
      { id: 1, name: "Burger", price: 50, quantity: 1 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    render(<CartPage />);

    fireEvent.click(screen.getByText("Clear Cart"));

    expect(mockClearCart).toHaveBeenCalled();
  });

  it("calls addToCart and reduceQuantity", () => {
    const cartItems = [
      { id: 1, name: "Pasta", price: 80, quantity: 1 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    render(<CartPage />);

    const plusButton = screen.getByText("+");
    const minusButton = screen.getByText("-");

    fireEvent.click(plusButton);
    fireEvent.click(minusButton);

    expect(mockAddToCart).toHaveBeenCalledWith(cartItems[0]);
    expect(mockReduceQuantity).toHaveBeenCalledWith("1");
  });

  it("shows PaymentButton when cart validation succeeds", async () => {
    const cartItems = [
      { id: 1, name: "Cake", price: 200, quantity: 1 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { valid: true },
    });

    render(<CartPage />);

    fireEvent.click(screen.getByText("Proceed to Pay"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/orders/validateCart", {
        cart: cartItems,
      });

      expect(screen.getByTestId("payment-button")).toBeInTheDocument();
    });
  });

  it("shows toast error when cart validation fails", async () => {
    const cartItems = [
      { id: 1, name: "Juice", price: 30, quantity: 2 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { valid: false },
    });

    render(<CartPage />);

    fireEvent.click(screen.getByText("Proceed to Pay"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please review your cart. Some item(s) price(s) are changed or out of stock."
      );
    });
  });

  it("updates special instructions input", () => {
    const cartItems = [
      { id: 1, name: "Sandwich", price: 60, quantity: 1 },
    ];

    jest.spyOn(require("@/context/CartContext"), "useCart").mockReturnValue({
      cart: cartItems,
      clearCart: mockClearCart,
      addToCart: mockAddToCart,
      reduceQuantity: mockReduceQuantity,
    });

    render(<CartPage />);

    const textarea = screen.getByPlaceholderText(
      "Add any special instructions for your order..."
    );

    fireEvent.change(textarea, { target: { value: "No onions" } });

    expect(textarea).toHaveValue("No onions");
  });
});