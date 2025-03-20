import { render, screen } from "@testing-library/react";
import { vi, expect, describe, it } from "vitest";
import DeviceDetails from "@/components/device-monitor/DeviceDetail";
import {
  useQuery,
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { IntlProvider } from "react-intl";
import DeviceDetailsPage from "@/app/device-monitor/[deviceId]/device-details/page";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({
    isLoading: false,
    isError: false,
    data: { logs: [] },
  }),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  QueryClient: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/deviceMonitor", () => ({
  getDeviceDetails: vi.fn(),
}));

const queryClient = new QueryClient();

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("DeviceDetailPage", () => {
  const deviceId = "test-device-id";

  it("renders the DeviceDetailPage correctly", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <DeviceDetailsPage params={{ deviceId }} />
        </QueryClientProvider>
      </IntlProvider>
    );

    expect(
      screen.getByRole("heading", { name: /device details/i })
    ).toBeTruthy();
  });
});

describe("DeviceDetails Component", () => {
  const deviceId = "1234";

  it("should display loading indicator when data is being fetched", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });

  it("should display device details when data is loaded", async () => {
    const deviceMock = {
      id: "1234",
      name: "Device 1",
      type: "Type A",
      serial_number: "SN123456",
      last_seen: "2024-12-20T12:00:00Z",
      is_active: "ONLINE",
      health: "healthy",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-12-01T11:00:00Z",
      properties: {},
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: deviceMock,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByText("Device 1")).toBeTruthy();
    expect(screen.getByText("Type A")).toBeTruthy();
    expect(screen.getByText("SN123456")).toBeTruthy();
  });

  it("should display 'Never' if last seen is null", async () => {
    const deviceMock = {
      id: "1234",
      name: "Device 1",
      type: "Type A",
      serial_number: "SN123456",
      last_seen: null,
      is_active: "ONLINE",
      health: "healthy",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-12-01T11:00:00Z",
      properties: {},
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: deviceMock,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByText("Never")).toBeTruthy();
  });

  it("should handle health status 'at risk'", async () => {
    const deviceMock = {
      id: "1234",
      name: "Device 1",
      type: "Type A",
      serial_number: "SN123456",
      last_seen: "2024-12-20T12:00:00Z",
      is_active: "ONLINE",
      health: "at_risk",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-12-01T11:00:00Z",
      properties: {},
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: deviceMock,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByText("at_risk")).toBeTruthy();
  });

  it("should display 'Offline' if device is not active", async () => {
    const deviceMock = {
      id: "1234",
      name: "Device 1",
      type: "Type A",
      serial_number: "SN123456",
      last_seen: "2024-12-20T12:00:00Z",
      is_active: "OFFLINE",
      health: "healthy",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-12-01T11:00:00Z",
      properties: {},
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: deviceMock,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByText("OFFLINE")).toBeTruthy();
  });

  it("should display device properties if available", async () => {
    const deviceMock = {
      id: "1234",
      name: "Device 1",
      type: "Type A",
      serial_number: "SN123456",
      last_seen: "2024-12-20T12:00:00Z",
      is_active: "ONLINE",
      health: "healthy",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-12-01T11:00:00Z",
      properties: {
        cpu: "85.0",
        memory: "70.0",
        disk: "90.0",
      },
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: deviceMock,
      isLoading: false,
    });

    render(
      <IntlProvider locale="en">
        <DeviceDetails deviceId={deviceId} />
      </IntlProvider>
    );

    expect(screen.getByText("85.0%")).toBeTruthy();
    expect(screen.getByText("70.0%")).toBeTruthy();
  });
});
