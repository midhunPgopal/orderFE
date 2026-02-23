import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "@/app/auth/signup/page";
import api from "@/lib/api";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

jest.mock("@/lib/api");

describe("Signup Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders signup form fields", () => {
        render(<Signup />);

        // Heading
        expect(
            screen.getByRole("heading", { name: /sign up/i })
        ).toBeInTheDocument();

        // Submit button
        expect(
            screen.getByRole("button", { name: /^sign up$/i })
        ).toBeInTheDocument();

        // Inputs
        expect(screen.getByLabelText("First Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Phone (without country code)")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    });

    it("shows validation errors when submitting empty form", async () => {
        render(<Signup />);

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(screen.getByText("First name is required")).toBeInTheDocument();
            expect(screen.getByText("Last name is required")).toBeInTheDocument();
            expect(screen.getByText("Email is required")).toBeInTheDocument();
            expect(screen.getByText("Phone is required")).toBeInTheDocument();
            expect(screen.getByText("Password is required")).toBeInTheDocument();
            expect(screen.getByText("Confirm your password")).toBeInTheDocument();
        });
    });

    it("shows error when passwords do not match", async () => {
        render(<Signup />);

        await userEvent.type(screen.getByLabelText("First Name"), "John");
        await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
        await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
        await userEvent.type(screen.getByLabelText("Phone (without country code)"), "1234567");
        await userEvent.type(screen.getByLabelText("Password"), "123456");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "654321");

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });
    });

    it("submits form and redirects on successful signup", async () => {
        (api.post as jest.Mock).mockResolvedValueOnce({ data: {} });

        render(<Signup />);

        await userEvent.type(screen.getByLabelText("First Name"), "John");
        await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
        await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
        await userEvent.type(screen.getByLabelText("Phone (without country code)"), "1234567");
        await userEvent.type(screen.getByLabelText("Password"), "123456");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "123456");

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith("/auth/signup", {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                phone: "1234567",
                password: "123456",
                role: "USER",
            });

            expect(pushMock).toHaveBeenCalledWith("/auth/signin");
        });
    });

    it("shows API error message on failure", async () => {
        (api.post as jest.Mock).mockRejectedValueOnce({
            response: { data: { message: "Email already exists" } },
        });

        render(<Signup />);

        await userEvent.type(screen.getByLabelText("First Name"), "John");
        await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
        await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
        await userEvent.type(screen.getByLabelText("Phone (without country code)"), "1234567");
        await userEvent.type(screen.getByLabelText("Password"), "123456");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "123456");

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(screen.getByText("Email already exists")).toBeInTheDocument();
        });
    });

    it("disables button while loading", async () => {
        (api.post as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );

        render(<Signup />);

        await userEvent.type(screen.getByLabelText("First Name"), "John");
        await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
        await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
        await userEvent.type(screen.getByLabelText("Phone (without country code)"), "1234567");
        await userEvent.type(screen.getByLabelText("Password"), "123456");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "123456");

        const submitButton = screen.getByRole("button", {
            name: /^sign up$/i,
        });

        await userEvent.click(submitButton);

        // Wait for loading state
        const loadingButton = await screen.findByRole("button", {
            name: /signing up/i,
        });

        expect(loadingButton).toBeDisabled();
    });
});