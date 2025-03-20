import { render, screen, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  beforeAll,
} from "vitest";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";

import SessionCheck from "@/components/auth/SessionCheck";

// Mocking necessary hooks and modules
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/components/common/LoadingIndicator", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-indicator">Loading...</div>,
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

describe("SessionCheck", () => {
  const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when status is authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { error: null },
      status: "authenticated",
    });

    render(
      <SessionCheck>
        <div>Children Component</div>
      </SessionCheck>
    );

    // Wait for children to render once loading is complete
    await waitFor(() => {
      expect(screen.getByText("Children Component")).toBeTruthy();
    });
  });

  it("should sign out and redirect to /auth/error if RefreshAccessTokenError is encountered", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { error: "RefreshAccessTokenError" },
      status: "authenticated",
    });

    (signOut as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    render(
      <SessionCheck>
        <div>Children Component</div>
      </SessionCheck>
    );

    // Wait for the signOut function to be called and ensure the redirect happens
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/auth/error" });
    });
  });

  it("should not sign out if there is no RefreshAccessTokenError", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { error: null },
      status: "authenticated",
    });

    render(
      <SessionCheck>
        <div>Children Component</div>
      </SessionCheck>
    );

    // Wait for children to render and ensure signOut was not called
    await waitFor(() => {
      expect(screen.getByText("Children Component")).toBeTruthy();
      expect(signOut).not.toHaveBeenCalled();
    });
  });

  it("should handle errors during sign out gracefully", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { error: "RefreshAccessTokenError" },
      status: "authenticated",
    });

    (signOut as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Sign out failed")
    );

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <SessionCheck>
        <div>Children Component</div>
      </SessionCheck>
    );

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Sign out failed",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
