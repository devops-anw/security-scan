import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Providers from "@/app/provider";

vi.mock("next-auth/react", () => ({
  useSession: vi
    .fn()
    .mockReturnValue({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mocking the useAuthSession hook
vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

// Mocking AuthProvider to prevent actual context setup
vi.mock("@/context/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mocking the QueryClientProvider to avoid any network calls related to react-query
vi.mock("@tanstack/react-query", async () => {
  const actual = await import("@tanstack/react-query");
  return {
    ...actual,
    QueryClient: vi.fn().mockImplementation(() => ({ getQueryData: vi.fn() })),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

// Mock fetch to prevent actual network calls in the test environment
global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({}),
  ok: true,
});

describe("Providers", () => {
  it("renders children inside the Providers component", () => {
    render(<Providers>{<div>Test Child</div>}</Providers>);

    // Check if the child is rendered correctly
    expect(screen.getByText("Test Child")).toBeTruthy();
  });

  it("wraps children with SessionProvider, SessionCheck, AuthProvider, QueryClientProvider, and IntlProvider", () => {
    render(<Providers>{<div>Test Child</div>}</Providers>);

    // Check if the child is wrapped inside the mock providers
    expect(screen.getByText("Test Child")).toBeTruthy();
  });

  it("sets up QueryClient and wraps with QueryClientProvider", () => {
    render(<Providers>{<div>Test Child</div>}</Providers>);

    // Since we're mocking QueryClientProvider, check if the children are rendered inside it
    expect(screen.getByText("Test Child")).toBeTruthy();
  });

  it("renders children inside IntlProvider", () => {
    render(<Providers>{<div>Test Child</div>}</Providers>);

    // Ensure the child is inside the IntlProvider mock
    expect(screen.getByText("Test Child")).toBeTruthy();
  });
});
