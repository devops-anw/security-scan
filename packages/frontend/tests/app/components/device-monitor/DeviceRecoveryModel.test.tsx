import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useQuery } from "@tanstack/react-query";

import DeviceRecoveryModal from "@/components/device-monitor/DeviceRecovery";
import { IntlProvider } from "react-intl";

// Mocking the necessary hooks and components
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/lib/fileRecovery", () => ({
  getDeviceRecoveryList: vi.fn(),
}));

describe("DeviceRecoveryModal", () => {
  const mockDeviceId = "123";
  const mockToken = "token";

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the modal when open", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceRecoveryModal deviceId={mockDeviceId} token={mockToken} />
      </IntlProvider>
    );

    expect(screen.getByText("Recovery List")).toBeTruthy();
  });

  it("should display error message when there is an error in fetching recovery data", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isError: true,
      error: new Error("Failed to load activity logs"),
    });

    render(
      <IntlProvider locale="en">
        <DeviceRecoveryModal deviceId={mockDeviceId} token={mockToken} />
      </IntlProvider>
    );

    expect(screen.getByText(/Failed to load activity logs/i)).toBeTruthy();
  });

  it("should display recovery data when fetched successfully", () => {
    const mockData = {
      recoveries: [
        { id: 1, file_name: "file1.txt", status: "Completed" },
        { id: 2, file_name: "file2.txt", status: "Pending" },
      ],
      total: 2,
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isError: false,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceRecoveryModal deviceId={mockDeviceId} token={mockToken} />
      </IntlProvider>
    );

    expect(screen.getByText("file1.txt")).toBeTruthy();
    expect(screen.getByText("file2.txt")).toBeTruthy();
  });
});
