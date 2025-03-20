import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, beforeAll } from "vitest";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { AuthProvider } from "@/context/AuthProvider";
import { AuthContext } from "@/context/AuthContext";
import React from "react";

// Mocking dependencies
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@/components/common/LoadingIndicator", () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

describe("AuthProvider", () => {
  const mockUseSession = useSession as ReturnType<typeof vi.fn>;
  const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
    });
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });
  });

  it("renders children when session is authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "John Doe", email: "john@example.com" },
        idToken: "mock_id_token",
      },
      status: "authenticated",
    });

    render(
      <AuthProvider>
        <div>Child Component</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Child Component")).toBeTruthy();
    });
  });

  it("calls signIn when login is triggered", async () => {
    const TestComponent = () => {
      const { login } = React.useContext(AuthContext) || {};
      return <button onClick={login}>Login</button>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("Login"));

    expect(signIn).toHaveBeenCalledWith("keycloak", {
      callbackUrl: expect.stringContaining("/auth/callback"),
    });
  });

  it("logs out and clears user state on logout", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "John Doe", email: "john@example.com" },
        idToken: "mock_id_token",
      },
      status: "authenticated",
    });

    const TestComponent = () => {
      const { logout } = React.useContext(AuthContext) || {};
      return <button onClick={logout}>Logout</button>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ redirect: false });
    });
  });

  it("provides correct authentication state via context", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "John Doe", email: "john@example.com" },
        idToken: "mock_id_token",
      },
      status: "authenticated",
    });

    const TestComponent = () => {
      const { isAuthenticated, user } = React.useContext(AuthContext) || {};
      return (
        <>
          <div data-testid="auth-state">
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </div>
          <div data-testid="user-name">{user?.name}</div>
        </>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-state").textContent).toBe(
        "Authenticated"
      );
      expect(screen.getByTestId("user-name").textContent).toBe("John Doe");
    });
  });
});
