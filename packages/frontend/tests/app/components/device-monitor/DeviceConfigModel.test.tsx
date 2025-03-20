import { describe, it, vi, beforeEach, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { getDeviceEndPointConfigDetails } from "@/lib/deviceEndPoint";
import { useAuthSession } from "@/hooks/useAuthSession";
import DeviceConfigModal from "@/components/device-monitor/DeviceConfig";
import { IntlProvider } from "react-intl";
import DeviceConfigPage from "@/app/device-monitor/[deviceId]/device-config/page";

vi.mock("@/lib/deviceEndPoint");
vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));
const queryClient = new QueryClient();

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("DeviceConfigPage", () => {
  const deviceId = "test-device-id";

  it("renders the DeviceConfigPage correctly with breadcrumbs and device config", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <DeviceConfigPage params={{ deviceId }} />
        </QueryClientProvider>
      </IntlProvider>
    );

    expect(screen.getByText("Device Config")).toBeTruthy();
  });
});

describe("DeviceConfigModal", () => {
  const mockUser = { tenantId: "test-tenant" };

  beforeEach(() => {
    vi.resetAllMocks();
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    });
  });

  const renderComponent = (props = {}) => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <DeviceConfigModal deviceId="test-device-id" {...props} />
        </QueryClientProvider>
      </IntlProvider>
    );
  };

  it("renders the modal when open", async () => {
    (
      getDeviceEndPointConfigDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      name: "Test Device",
      type: "Test Type",
      config: {},
    });

    renderComponent();

    expect(await screen.findByText(/Device Configuration/i)).toBeTruthy();
  });

  it("displays the configuration details when data is fetched", async () => {
    (
      getDeviceEndPointConfigDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      name: "Test Device",
      type: "Test Type",
      config: {},
    });

    renderComponent();

    expect(await screen.findByText(/Test Device/i)).toBeTruthy();
  });

  it("enables edit mode when edit button is clicked", async () => {
    (
      getDeviceEndPointConfigDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      name: "Test Device",
      type: "Test Type",
      config: {},
    });

    renderComponent();

    fireEvent.click(await screen.findByText(/Edit/i));
    expect(await screen.findByText(/Save/i)).toBeTruthy();
  });

  it("cancels edit mode when cancel button is clicked", async () => {
    (
      getDeviceEndPointConfigDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      name: "Test Device",
      type: "Test Type",
      config: {},
    });

    renderComponent();

    fireEvent.click(await screen.findByText(/Edit/i));
    fireEvent.click(await screen.findByText(/Cancel/i));

    expect(screen.queryByText(/Save/i)).toBeNull();
  });
});
