import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntlProvider } from "react-intl";

import ActivityLogsComponent from "@/components/activity-logs/ActivityLogsComponent";
import { useQuery } from "@tanstack/react-query";
import ActivityLogs from "@/app/activity-logs/page";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({
    isLoading: false,
    isError: false,
    data: { logs: [] },
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

vi.mock("@/lib/activityLogs", () => ({
  getActivityLogs: vi.fn(),
}));

// Mock ProtectedRoute
vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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

describe("ActivityLogs", () => {
  it("renders ProtectedRoute and ActivityLogsComponent correctly", () => {
    render(
      <IntlProvider locale="en">
        <ActivityLogs />
      </IntlProvider>
    );

    const componentText = screen.getByText("Activity Logs / Telemetry");
    expect(componentText).to.exist;
  });
});

describe("ActivityLogsComponent", () => {
  it("should display an error message if fetching logs fails", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: true,
      error: { message: "No activity found" },
      data: null,
    });

    render(
      <IntlProvider locale="en">
        <ActivityLogsComponent />
      </IntlProvider>
    );

    const errorMessage = await screen.findByText("No activity found");
    expect(errorMessage).to.exist;
  });

  it("should display no activity found message when no logs are present", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { logs: [] },
    });

    render(
      <IntlProvider locale="en">
        <ActivityLogsComponent />
      </IntlProvider>
    );

    const noLogsMessage = await screen.findByText("No activity found");
    expect(noLogsMessage).to.exist;
  });

  it("should display logs when available", async () => {
    const mockLogs = [
      {
        id: "1",
        device_name: "Device 1",
        device_id: "D1",
        activity_type: "Login",
        severity: "critical",
        created_at: "2024-12-01T12:00:00Z",
        details: { additional_info: "Test Info" },
      },
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { logs: mockLogs },
    });

    render(
      <IntlProvider locale="en">
        <ActivityLogsComponent />
      </IntlProvider>
    );

    const deviceName = await screen.findByText("Device 1");
    expect(deviceName).to.exist;

    const activityType = await screen.findByText("Login");
    expect(activityType).to.exist;

    const severity = await screen.findByText("critical");
    expect(severity).to.exist;
  });

  it("should filter logs by severity", async () => {
    const mockLogs = [
      {
        id: "1",
        device_name: "Device 1",
        device_id: "D1",
        activity_type: "Login",
        severity: "critical",
        created_at: "2024-12-01T12:00:00Z",
        details: { additional_info: "Test Info" },
      },
      {
        id: "2",
        device_name: "Device 2",
        device_id: "D2",
        activity_type: "Logout",
        severity: "low",
        created_at: "2024-12-02T12:00:00Z",
        details: { additional_info: "Test Info" },
      },
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { logs: mockLogs },
    });

    render(
      <IntlProvider locale="en">
        <ActivityLogsComponent />
      </IntlProvider>
    );

    const severityFilter = screen.getByText("critical");
    fireEvent.click(severityFilter);

    // Wait for the filtered log to appear
    await waitFor(() => {
      const filteredLog = screen.getByText("Device 1");
      expect(filteredLog).toBeTruthy();
    });
  });

  it("should show a loading indicator when data is loading", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { container } = render(
      <IntlProvider locale="en" messages={{}}>
        <ActivityLogsComponent />
      </IntlProvider>
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });
});
