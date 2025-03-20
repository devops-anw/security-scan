import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntlProvider } from "react-intl";
import Header from "@/components/header/Header";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

// Mocking usePathname, useRouter, and useAuth hooks
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const messages = {
  en: {
    "header.dashboard": "Dashboard",
    "header.profile": "Profile",
    "header.logout": "Logout",
  },
};

const renderHeaderWithSession = (session: any) => {
  return render(
    <SessionProvider session={session}>
      <IntlProvider locale="en" messages={messages.en}>
        <Header onToggleSidebar={vi.fn()} />
      </IntlProvider>
    </SessionProvider>
  );
};

describe("Header", () => {
  beforeEach(() => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: vi.fn() });
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { name: "John Doe" },
      logout: vi.fn(),
    });
  });

  it("does not render the header on login, signup, or other specific pages", () => {
    const session = { user: { name: "John Doe" } };

    // Test for /login page
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/login");
    renderHeaderWithSession(session);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();

    // Test for /signup page
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/signup");
    renderHeaderWithSession(session);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders the header when not on login or signup page", () => {
    const session = { user: { name: "John Doe" } };
    renderHeaderWithSession(session);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders the user's name and avatar correctly", () => {
    const session = { user: { name: "John Doe" } };
    renderHeaderWithSession(session);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("does not render anything on restricted pages like /verify-email", () => {
    const session = { user: { name: "John Doe" } };

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/verify-email");
    renderHeaderWithSession(session);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });
});
