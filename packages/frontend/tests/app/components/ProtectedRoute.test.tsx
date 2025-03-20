import { describe, it, vi, expect } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/components/sidebar/Sidebar", () => ({
  default: vi.fn(() => <div data-testid="sidebar">Sidebar</div>),
}));

vi.mock("@/components/header/Header", () => ({
  default: vi.fn(({ onToggleSidebar }) => (
    <div data-testid="header" onClick={onToggleSidebar}>
      Header
    </div>
  )),
}));

vi.mock("@/components/common/LoadingIndicator", () => ({
  default: vi.fn(() => <div data-testid="loading-indicator">Loading...</div>),
}));

describe("ProtectedRoute Component", () => {
  it("redirects to login if user is unauthenticated", async () => {
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      status: "unauthenticated",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading indicator when session status is 'loading'", () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      status: "loading",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("renders authenticated layout when session status is 'authenticated'", () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("toggles sidebar visibility when header's toggle function is triggered", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    const header = screen.getByTestId("header");
    const sidebar = screen.getByTestId("sidebar");

    expect(sidebar).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(header);
    });
  });
});
