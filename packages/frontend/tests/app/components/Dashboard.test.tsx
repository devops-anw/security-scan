import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "@/app/dashboard/page";
import { useQuery } from "@tanstack/react-query";

import OrganizationDashboard from "@/components/dashboard/OrganizationDashboard";
import { IntlProvider } from "react-intl";

import { getDevices } from "@/lib/deviceMonitor";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({
    isLoading: false,
    isError: false,
    data: { logs: [] },
  }),
}));

vi.mock("@/lib/deviceMonitor", () => ({
  getDevices: vi.fn(),
}));

vi.mock("@/lib/activityLogs", () => ({
  getActivityLogs: vi.fn(),
}));

vi.mock("@/lib/fileRecovery", () => ({
  getRecoveryList: vi.fn(),
}));

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  __esModule: true,
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Dashboard Component", () => {
  it("render Dashboard Component correctly", async () => {
    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <Dashboard />
        </IntlProvider>
      );
    });

    expect(screen.getByText("Organization Dashboard")).toBeTruthy();
  });
});

describe("OrganizationDashboard", () => {
  it("shows loading state while data is being fetched", async () => {
    const mockData = {
      devices: [
        { health: "Healthy" },
        { health: "At Risk" },
        { health: "Critical" },
      ],
      total: 4,
    };
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: true,
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <OrganizationDashboard />
        </IntlProvider>
      );
    });
    expect(screen.getByText(/Total Devices/i)).toBeTruthy();

    const loadingElements = screen.getAllByText(/Loading.../i);
    expect(loadingElements[0]).toBeTruthy();
  });

  it("displays  total devices correctly", async () => {
    const mockData = {
      devices: [
        { health: "Healthy" },
        { health: "At Risk" },
        { health: "Critical" },
        { health: "Healthy" },
      ],
      total: 4,
    };

    (getDevices as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <OrganizationDashboard />
        </IntlProvider>
      );
    });

    expect(screen.getByText(/Total Devices/i)).toBeTruthy();
  });
  it("displays NoDevicesFound when no devices are available", async () => {
    const mockData = {
      devices: [],
      total: 0,
    };

    (getDevices as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <OrganizationDashboard />
        </IntlProvider>
      );
    });
    expect(screen.getByText(/No Devices Detected/i)).toBeTruthy();
  });
});
