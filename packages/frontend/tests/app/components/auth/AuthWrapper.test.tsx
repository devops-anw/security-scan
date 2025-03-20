import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthWrapper } from "@/components/auth/AuthWrapper";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn(),
}));

describe("AuthWrapper", () => {
  const mockRouterReplace = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: mockRouterReplace,
    });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/");
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

    render(
      <AuthWrapper>
        <div>Children Component</div>
      </AuthWrapper>
    );

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/admin/approval-signup-request"
      )
    );
  });

  it("should redirect to /dashboard when authenticated as a regular user", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "User",
      status: "authenticated",
    });

    render(
      <AuthWrapper>
        <div>Children Component</div>
      </AuthWrapper>
    );

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard")
    );
  });

  it("should redirect to /login when not authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      type: "",
      status: "unauthenticated",
    });

    render(
      <AuthWrapper>
        <div>Children Component</div>
      </AuthWrapper>
    );

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith("/login")
    );
  });

  it("should render children when the pathname is not / and authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "User",
      status: "authenticated",
    });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      "/some-other-path"
    );

    render(
      <AuthWrapper>
        <div>Children Component</div>
      </AuthWrapper>
    );

    expect(screen.getByText("Children Component")).toBeTruthy();
  });
});
