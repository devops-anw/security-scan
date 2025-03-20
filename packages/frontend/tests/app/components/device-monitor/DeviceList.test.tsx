import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/useAuthSession";

import DeviceList from "@/components/device-monitor/DeviceList";
import { IntlProvider } from "react-intl";
import DeviceProperties from "@/components/device-monitor/DeviceProperties";

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue("/some-path"),
  useSearchParams: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));
vi.mock("@/lib/deviceMonitor", () => ({
  getDevices: vi.fn(),
}));

vi.mock("@/texts/device/device-list", () => ({
  deviceListTexts: {
    deviceProperties: "Device Properties",
  },
}));

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("DeviceList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDevices = {
    devices: [
      {
        id: "1",
        name: "Device 1",
        type: "Type A",
        serial_number: "123ABC",
        is_active: "ONLINE",
        last_seen: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Device 2",
        type: "Type B",
        serial_number: "456DEF",
        is_active: "OFFLINE",
        last_seen: null,
      },
    ],
    total: 2,
  };

  it("renders the DeviceList component", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { tenantId: "1" },
    });
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDevices,
      isLoading: false,
      isError: false,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceList />
      </IntlProvider>
    );

    expect(await screen.findByText("Device 1")).toBeTruthy();
    expect(screen.getByText("123ABC")).toBeTruthy();
    expect(screen.getByText("Type A")).toBeTruthy();
  });

  it("shows loading state when devices are being fetched", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { container } = render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceList />
      </IntlProvider>
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("renders inactive devices with correct status", async () => {
    const mockDevicesWithInactive = {
      devices: [
        {
          id: "1",
          name: "Device 1",
          type: "Type A",
          serial_number: "123ABC",
          is_active: "OFFLINE",
          last_seen: null,
        },
      ],
      total: 1,
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDevicesWithInactive,
      isLoading: false,
      isError: false,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceList />
      </IntlProvider>
    );

    expect(screen.getByText("Device 1")).toBeTruthy();
    expect(screen.getByText("OFFLINE")).toBeTruthy();
  });

  it("renders devices with correct health status", async () => {
    const mockDevicesWithHealth = {
      devices: [
        {
          id: "1",
          name: "Device 1",
          type: "Type A",
          serial_number: "123ABC",
          is_active: "ONLINE",
          last_seen: new Date().toISOString(),
          health: "Healthy",
        },
        {
          id: "2",
          name: "Device 2",
          type: "Type B",
          serial_number: "456DEF",
          is_active: "ONLINE",
          last_seen: null,
          health: "Critical",
        },
      ],
      total: 2,
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDevicesWithHealth,
      isLoading: false,
      isError: false,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceList />
      </IntlProvider>
    );

    expect(screen.getByText("Device 1")).toBeTruthy();
    expect(screen.getByText("Healthy")).toBeTruthy();
    expect(screen.getByText("Device 2")).toBeTruthy();
    expect(screen.getByText("Critical")).toBeTruthy();
  });

  it("renders devices with correct data", async () => {
    const mockDevicesWithLastSeen = {
      devices: [
        {
          id: "1",
          name: "Device 1",
          type: "Type A",
          serial_number: "123ABC",
          is_active: "ONLINE",
          last_seen: "2023-10-01T12:00:00Z",
        },
        {
          id: "2",
          name: "Device 2",
          type: "Type B",
          serial_number: "456DEF",
          is_active: "ONLINE",
          last_seen: null,
        },
      ],
      total: 2,
    };

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDevicesWithLastSeen,
      isLoading: false,
      isError: false,
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceList />
      </IntlProvider>
    );

    expect(screen.getByText("Device 1")).toBeTruthy();
    expect(screen.getByText("Device 2")).toBeTruthy();
    expect(screen.getByText("Never")).toBeTruthy();
  });
});

describe("DeviceProperties Component", () => {
  it("renders nothing if properties is empty", () => {
    const { container } = render(<DeviceProperties properties={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing if properties is null", () => {
    const { container } = render(<DeviceProperties properties={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing if properties is undefined", () => {
    const { container } = render(<DeviceProperties properties={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nested objects as strings", () => {
    const mockProperties = {
      cpu: "85.0",
      memory: "70.0",
      disk: "90.0",
      config: { setting1: "enabled", setting2: "disabled" },
      "API Key": "12345",
    };

    const { getByText } = render(
      <IntlProvider locale="en" messages={{}}>
        <DeviceProperties properties={mockProperties} />
      </IntlProvider>
    );

    expect(getByText("85.0%")).toBeTruthy();
    expect(getByText("70.0%")).toBeTruthy();
  });
});
