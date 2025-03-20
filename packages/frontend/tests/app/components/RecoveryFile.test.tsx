import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecoveryListComponent from "@/components/recovery/RecoveryListComponent";
import { useQuery } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import Recovery from "@/app/recovery/page";
import { useAuthSession } from "@/hooks/useAuthSession";

// Mocking necessary components and hooks
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({
    isLoading: false,
    isError: false,
    data: { recoveries: [] },
  }),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

vi.mock("@/lib/fileRecovery", () => ({
  getRecoveryList: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue("/some-path"),
  useSearchParams: vi.fn().mockReturnValue({
    get: vi.fn().mockImplementation((key) => {
      if (key === "search") {
        return "testSearchTerm";
      }
      return null;
    }),
  }),
}));

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Recovery Page", () => {
  it("renders ProtectedRoute and RecoveryComponent correctly", () => {
    render(
      <IntlProvider locale="en">
        <Recovery />
      </IntlProvider>
    );
    const componentText = screen.getByText("Recovery List");
    expect(componentText).toBeTruthy();
  });
});

// Test suite for RecoveryListComponent
describe("RecoveryListComponent", () => {
  beforeEach(() => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      accessToken: "test-token",
    });
  });

  it("renders RecoveryListComponent with correct title", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    render(
      <IntlProvider locale="en">
        <RecoveryListComponent />
      </IntlProvider>
    );
    expect(screen.getByText("Recovery List")).toBeTruthy();
  });

  it("displays loading indicator while fetching data", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    const { container } = render(
      <IntlProvider locale="en" messages={{}}>
        <RecoveryListComponent />
      </IntlProvider>
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("displays NoRecoveryFound when no recoveries are available", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { recoveries: [] },
      isLoading: false,
      isError: false,
    });
    render(
      <IntlProvider locale="en">
        <RecoveryListComponent />
      </IntlProvider>
    );
    expect(screen.getByText(/No recovery list found/)).toBeTruthy();
  });

  it("displays error message when an error occurs", () => {
    const errorMessage = "No recovery list found";
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: errorMessage },
    });
    render(
      <IntlProvider locale="en">
        <RecoveryListComponent />
      </IntlProvider>
    );
    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it("renders recovery list when data is loaded successfully", async () => {
    const mockRecoveryList = {
      recoveries: [
        {
          id: "1",
          device_name: "Device 1",
          device_id: "123",
          file_name: "File 1",
          status: "Completed",
          recovery_method: "Method 1",
          file_size: 1024,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    };
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockRecoveryList,
    });

    render(
      <IntlProvider locale="en">
        <RecoveryListComponent />
      </IntlProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Device 1")).toBeTruthy();
      expect(screen.getByText("File 1")).toBeTruthy();
      expect(screen.getByText("Completed")).toBeTruthy();
    });
  });

  // it("renders search and filter components when there are recoveries", async () => {
  //   const mockRecoveryList = {
  //     recoveries: [
  //       {
  //         id: "1",
  //         device_name: "Device 1",
  //         device_id: "123",
  //         file_name: "File 1",
  //         status: "Completed",
  //         recovery_method: "Method 1",
  //         file_size: 1024,
  //         created_at: "2024-01-01T00:00:00Z",
  //       },
  //     ],
  //     total: "10",
  //   };

  //   (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
  //     isLoading: false,
  //     isError: false,
  //     data: mockRecoveryList,
  //   });

  //   render(
  //     <IntlProvider locale="en">
  //       <RecoveryListComponent />
  //     </IntlProvider>
  //   );

  //   // Ensure the search input is visible
  //   expect(
  //     screen.getByPlaceholderText("Search by device name or file name...")
  //   ).toBeInTheDocument();

  //   // Ensure the filter options are visible
  //   expect(screen.getByPlaceholderText("Filter by device")).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText("Filter by status")).toBeInTheDocument();

  //   // Optionally: test that the filter component is interactive
  //   const deviceFilter = screen.getByPlaceholderText("Filter by device");
  //   const statusFilter = screen.getByPlaceholderText("Filter by status");

  //   // Assuming these are select dropdowns, you can assert the options are available
  //   expect(deviceFilter).toBeEnabled();
  //   expect(statusFilter).toBeEnabled();
  // });
});
