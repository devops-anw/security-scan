import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePendingUsers } from "@/hooks/usePendingUsers";
import { PendingApproval } from "@/components/pending-approval/PendingApproval";
import { IntlProvider } from "react-intl";
import ApprovalSignupRequest from "@/app/admin/approval-signup-request/page";

// Mocking the necessary modules
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi
    .fn()
    .mockReturnValue({ isAuthenticated: true, user: { id: "user-123" } }),
}));

vi.mock("@/hooks/usePendingUsers", () => ({
  usePendingUsers: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
}));

vi.mock("next/navigation");

const mockApproveUser = vi.fn();
const mockRejectUser = vi.fn();

(useMutation as ReturnType<typeof vi.fn>).mockImplementation((options) => {
  if (options.mutationFn === mockApproveUser)
    return { mutateAsync: mockApproveUser };
  if (options.mutationFn === mockRejectUser)
    return { mutateAsync: mockRejectUser };
  return {};
});

const mockPush = vi.fn();
(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

describe("ApprovalSignupRequest", () => {
  it("renders ProtectedRoute and PendingApproval correctly", () => {
    render(
      <IntlProvider locale="en">
        <ApprovalSignupRequest />
      </IntlProvider>
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(
      screen.getByText("Organizations Pending Approval")
    ).toBeInTheDocument();
  });
});

describe("PendingApproval Component", () => {
  const mockPendingUsersData = [
    {
      id: "1",
      email: "it@example.com",
      organization: { name: "Org 1" },
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
    },
    {
      id: "2",
      email: "user@example.com",
      organization: { name: "Org 2" },
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
    },
  ];

  const renderWithIntl = (ui: React.ReactNode) => {
    return render(<IntlProvider locale="en">{ui}</IntlProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error message when there is an error fetching users", () => {
    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithIntl(<PendingApproval />);

    expect(
      screen.getByText("Unable to Load Organizations Pending Approval")
    ).toBeInTheDocument();
  });

  it("should render the list of pending users", () => {
    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
    });

    renderWithIntl(<PendingApproval />);

    expect(screen.getByText("Org 1")).toBeInTheDocument();
    expect(screen.getByText("it@example.com")).toBeInTheDocument();
    expect(screen.getByText("Org 2")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("should filter users by search term", async () => {
    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
    });

    renderWithIntl(<PendingApproval />);

    const searchInput = screen.getByPlaceholderText(
      "Search by organization name or email id..."
    );

    fireEvent.change(searchInput, { target: { value: "Org 1" } });

    await waitFor(() => {
      expect(screen.getByText("Org 1")).toBeInTheDocument();
      expect(screen.queryByText("Org 2")).not.toBeInTheDocument();
    });
  });

  it("should show 'No Pending Users Found' if there are no users", () => {
    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithIntl(<PendingApproval />);

    expect(screen.getByText("No pending users found")).toBeInTheDocument();
  });

  it("handles approve mutation successfully", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123" },
    });

    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
    });

    const approvePendingUsers = vi.fn().mockResolvedValue({});
    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: approvePendingUsers,
    });

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <PendingApproval />
      </IntlProvider>
    );

    const approveButton = screen.getAllByText(/Approve/)[0];
    fireEvent.click(approveButton);

    await waitFor(() => expect(approvePendingUsers).toBeTruthy());
  });

  it("handles reject mutation successfully", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123" },
    });

    (usePendingUsers as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
    });

    const rejectPendingUsers = vi.fn().mockResolvedValue({});
    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: rejectPendingUsers,
    });

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPendingUsersData,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <PendingApproval />
      </IntlProvider>
    );

    // Select the first "Reject" button from the list
    const rejectButton = screen.getAllByText(/Reject/)[0];
    fireEvent.click(rejectButton);

    await waitFor(() => expect(rejectPendingUsers).toBeTruthy());
  });
});
