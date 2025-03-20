import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useRouter } from "next/navigation";
import { UserList } from "@/components/users/UserList";
import { useQuery } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Users from "@/app/admin/users/page";

// Mocks for external dependencies
vi.mock("@tanstack/react-query");
vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));
vi.mock("next/navigation");
vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

const pushMock = vi.fn();
(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: pushMock });

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("AgentManagementPage", () => {
  const mockUsersData = {
    data: [
      {
        id: 1,
        email: "it@example.com",
        organization: { name: "Org 1" },
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        attributes: { status: ["active"] },
      },
      {
        id: 2,
        email: "user@example.com",
        organization: { name: "Org 2" },
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        attributes: { status: ["inactive"] },
      },
    ],
  };

  beforeEach(() => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "Platform Admin",
    });

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: vi.fn() });

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUsersData,
      isLoading: false,
      isError: false,
    });
  });

  it("renders the Users List component inside ProtectedRoute", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <Users />
      </IntlProvider>
    );

    expect(screen.getByText("Organization Users")).toBeInTheDocument();
    expect(screen.getByText("Organization Users")).toBeInTheDocument();
  });
});

describe("UserList Component", () => {
  const mockUsersData = {
    data: [
      {
        id: 1,
        email: "it@example.com",
        organization: { name: "Org 1" },
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        attributes: { status: ["active"] },
      },
      {
        id: 2,
        email: "user@example.com",
        organization: { name: "Org 2" },
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        attributes: { status: ["inactive"] },
      },
    ],
  };

  beforeEach(() => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      type: "Platform Admin",
    });

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: vi.fn() });

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUsersData,
      isLoading: false,
      isError: false,
    });
  });

  it("renders the UserList title", () => {
    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    expect(screen.getByText("Organization Users")).toBeInTheDocument();
  });

  it("displays users correctly", async () => {
    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    expect(screen.getByText("Org 1")).toBeInTheDocument();
    expect(screen.getByText("it@example.com")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("search functionality works correctly", async () => {
    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    const searchInput = screen.getByPlaceholderText(
      "Search by organization name or email id..."
    );
    fireEvent.change(searchInput, { target: { value: "Org 1" } });

    await waitFor(() => {
      expect(screen.getByText("Org 1")).toBeInTheDocument();
      expect(screen.queryByText("Org 2")).not.toBeInTheDocument();
    });
  });

  it("displays error message if there is an error fetching data", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    expect(screen.getByText("Unable to Load Users")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We encountered an issue while trying to load the user list. Please refresh the page or contact support if the issue continues."
      )
    ).toBeInTheDocument();
  });

  it("displays no users found message when no users match the search", async () => {
    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    const searchInput = screen.getByPlaceholderText(
      "Search by organization name or email id..."
    );
    fireEvent.change(searchInput, { target: { value: "Nonexistent Org" } });

    await waitFor(() => {
      expect(
        screen.getByText("Try adjusting your search term.")
      ).toBeInTheDocument();
    });
  });

  it("navigates to login page if user is not authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      type: "Guest",
    });

    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });
  });

  it("filters out SUPER_FE_ADMIN_EMAIL users", async () => {
    const mockSuperAdminUser = {
      id: 3,
      email: "platformadmin@example.com",
      organization: { name: "Org 3" },
      firstName: "Super",
      lastName: "Admin",
      username: "platformadmin",
      attributes: { status: ["active"] },
    };

    const updatedMockUsersData = {
      ...mockUsersData,
      data: [...mockUsersData.data, mockSuperAdminUser],
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: updatedMockUsersData,
      isLoading: false,
      isError: false,
    });

    render(
      <IntlProvider locale="en">
        <UserList />
      </IntlProvider>
    );

    expect(
      screen.queryByText("platformadmin@example.com")
    ).not.toBeInTheDocument();
  });
});
