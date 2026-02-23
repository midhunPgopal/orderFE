import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "@/app/auth/signin/page"; // adjust path if needed
import api from "@/lib/api";
import userEvent from "@testing-library/user-event";

// 🔹 Mock router
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

// 🔹 Mock api
jest.mock("@/lib/api", () => ({
    post: jest.fn(),
}));

// 🔹 Mock context
const setUserMock = jest.fn();

jest.mock("@/context/UserContext", () => ({
    useUser: () => ({
        setUser: setUserMock,
    }),
}));

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("renders login form", () => {
        render(<Login />);

        expect(
            screen.getByRole("heading", { name: /login/i })
        ).toBeInTheDocument();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /^login$/i })
        ).toBeInTheDocument();
    });

    it("shows error if fields are empty", async () => {
        render(<Login />);

        await userEvent.click(
            screen.getByRole("button", { name: /^login$/i })
        );

        expect(
            await screen.findByText(/all fields are required/i)
        ).toBeInTheDocument();
    });

    it("logs in successfully", async () => {
        (api.post as jest.Mock).mockResolvedValue({
            data: { token: "fake-token" },
        });

        render(<Login />);

        await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
        await userEvent.type(screen.getByLabelText(/password/i), "password");

        await userEvent.click(
            screen.getByRole("button", { name: /^login$/i })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith("/auth/signin", {
                email: "test@test.com",
                password: "password",
            });
        });
    });

    it("shows error message on API failure", async () => {
        (api.post as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: "Invalid credentials",
                },
            },
        });

        render(<Login />);

        await userEvent.type(screen.getByLabelText(/email/i), "wrong@test.com");
        await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");

        await userEvent.click(
            screen.getByRole("button", { name: /^login$/i })
        );

        expect(
            await screen.findByText(/invalid credentials/i)
        ).toBeInTheDocument();
    });

    it("shows loading state while submitting", async () => {
        (api.post as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );

        render(<Login />);

        await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
        await userEvent.type(screen.getByLabelText("Password"), "password");

        const button = screen.getByRole("button", { name: /^login$/i });

        await userEvent.click(button);

        expect(button).toBeDisabled();
        expect(button).toHaveTextContent(/logging in/i);
    });

    it("navigates to signup page", () => {
        render(<Login />);

        fireEvent.click(screen.getByText("Sign Up"));

        expect(pushMock).toHaveBeenCalledWith("/auth/signup");
    });
});