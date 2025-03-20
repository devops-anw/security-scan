import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  beforeAll,
} from "vitest";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getDevices } from "@/lib/deviceMonitor";
import AuthCallback from "@/components/auth/AuthCallback";
import { IntlProvider } from "react-intl";
import AuthCallbackPage from "@/app/auth/callback/page";
import AuthError from "@/app/auth/error/page";

// Mocking the necessary hooks and modules
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

vi.mock("@/lib/deviceMonitor", () => ({
  getDevices: vi.fn(),
}));

const mockLogin = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock ProtectedRoute
vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

// Test Suite for AuthCallbackPage
describe("AuthCallbackPage", () => {
  const mockRouterReplace = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: mockRouterReplace,
    });
  });

  it("renders ProtectedRoute and AuthCallbackPage correctly", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "Platform Admin",
      status: "authenticated",
    });
    render(
      <IntlProvider locale="en">
        <AuthCallbackPage />
      </IntlProvider>
    );

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/admin/approval-signup-request"
      )
    );
  });
});

// Test Suite for AuthCallback
describe("AuthCallback", () => {
  const mockRouterReplace = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: mockRouterReplace,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /admin/approval-signup-request when authenticated as Platform Admin", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "Platform Admin",
      status: "authenticated",
    });

    render(<AuthCallback />);

    // Wait for the redirect to happen
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/admin/approval-signup-request"
      )
    );
  });

  it("should redirect to /dashboard when authenticated and device is registered", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "User",
      status: "authenticated",
    });

    (getDevices as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 1 }); // Mocking a successful response with a registered device

    render(<AuthCallback />);

    // Wait for the redirect to happen
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard")
    );
  });

  it("should redirect to /agent-download when authenticated and device is not registered", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "User",
      status: "authenticated",
    });

    (getDevices as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 0 }); // Mocking a response with no registered device

    render(<AuthCallback />);

    // Wait for the redirect to happen
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/agent-download")
    );
  });

  it("should redirect to /login when not authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      type: "",
      status: "unauthenticated",
    });

    render(<AuthCallback />);

    // Wait for the redirect to happen
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/login")
    );
  });

  it("should handle errors in (getDevices as ReturnType<typeof vi.fn>) gracefully", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "User",
      status: "authenticated",
    });

    (getDevices as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("API error")
    );

    render(<AuthCallback />);

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/agent-download")
    );
  });
});

// Test Suite for AuthError
describe("AuthError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authentication error message correctly", () => {
    render(<AuthError />);

    expect(screen.getByText("Authentication Error")).toBeTruthy();
    expect(
      screen.getByText("There was a problem with your authentication session.")
    ).toBeTruthy();
    expect(
      screen.getByText(
        "This could be due to an expired session or an issue with your login credentials. Please try logging in again. If the problem persists, contact support."
      )
    ).toBeTruthy();
  });

  it("calls login function when 'Go to Login' button is clicked", () => {
    render(<AuthError />);

    const loginButton = screen.getByText("Go to Login");
    fireEvent.click(loginButton);

    expect(mockLogin).toBeTruthy();
  });

  it("navigates to the homepage when 'Return to Home Page' link is clicked", () => {
    render(<AuthError />);

    const homeLink = screen.getByText("Return to Home Page");
    fireEvent.click(homeLink);

    expect(window.location.pathname).toBe("/");
  });
});
