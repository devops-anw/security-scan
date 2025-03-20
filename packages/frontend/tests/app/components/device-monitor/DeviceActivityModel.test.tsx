import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useQuery } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import DeviceActivityLogsModal from "@/components/device-monitor/DeviceActivityLogs";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({
    isLoading: false,
    isError: false,
    data: { logs: [] },
  }),
}));

vi.mock("@/lib/activityLogs", () => ({
  getDeviceActivityLogs: vi.fn(),
}));

describe("DeviceActivityLogsModal", () => {
  it("renders error message when there is an error fetching logs", async () => {
    const errorMessage = "Failed to load activity logs";
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      error: { message: errorMessage },
      data: null,
    });
    render(
      <IntlProvider locale="en">
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );
    await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
  });

  it("renders empty state when no logs are available", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: { logs: [] },
    });
    render(
      <IntlProvider locale="en">
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );
    expect(screen.getByText("No activity found")).toBeTruthy();
  });

  it("renders a loading indicator when data is being fetched", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: null,
    });
    render(
      <IntlProvider locale="en">
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );
    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
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
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    const activityType = await screen.findByText("Login");
    expect(activityType).to.exist;

    const severity = await screen.findByText("critical");
    expect(severity).to.exist;
  });

  it("should display multiple logs when available", async () => {
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
        severity: "high",
        created_at: "2024-12-02T12:00:00Z",
        details: { additional_info: "Test Info 2" },
      },
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { logs: mockLogs },
    });

    render(
      <IntlProvider locale="en">
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    const activityType1 = await screen.findByText("Login");
    expect(activityType1).to.exist;

    const activityType2 = await screen.findByText("Logout");
    expect(activityType2).to.exist;

    const severity1 = await screen.findByText("critical");
    expect(severity1).to.exist;

    const severity2 = await screen.findByText("high");
    expect(severity2).to.exist;
  });

  it("should display additional info when available", async () => {
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
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    const additionalInfo = await screen.findByText("Test Info");
    expect(additionalInfo).to.exist;
  });

  it("should handle no additional info gracefully", async () => {
    const mockLogs = [
      {
        id: "1",
        device_name: "Device 1",
        device_id: "D1",
        activity_type: "Login",
        severity: "critical",
        created_at: "2024-12-01T12:00:00Z",
        details: {},
      },
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { logs: mockLogs },
    });

    render(
      <IntlProvider locale="en">
        <DeviceActivityLogsModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    const activityType = await screen.findByText("Login");
    expect(activityType).to.exist;

    const severity = await screen.findByText("critical");
    expect(severity).to.exist;
  });
});
