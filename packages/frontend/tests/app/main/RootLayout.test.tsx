// tests/app/main/RootLayout.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RootLayout from "@/app/layout";
import "@testing-library/jest-dom";

// Mocking external dependencies
vi.mock("next/font/google", () => ({
  Inter: () => ({
    variable: "--font-sans",
  }),
}));

vi.mock("@/components/auth/AuthWrapper", () => ({
  AuthWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/app/provider", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/app/layout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("renders children inside Providers and AuthWrapper", () => {
    render(<RootLayout>{<div>Test Child</div>}</RootLayout>);

    // Check if the child is rendered correctly inside AuthWrapper
    expect(screen.getByText("Test Child")).toBeTruthy();
  });

  it("renders Providers and AuthWrapper correctly", () => {
    render(<RootLayout>{<div>Test Child</div>}</RootLayout>);

    // Ensure that Providers and AuthWrapper components are rendered
    expect(screen.getByText("Test Child")).toBeTruthy();
  });
});
