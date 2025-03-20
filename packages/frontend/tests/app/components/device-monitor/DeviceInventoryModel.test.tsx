import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import DeviceInventoryModal from "@/components/device-monitor/DeviceInventory";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

const mockApplications = [
  {
    id: "1",
    device_id: "device123",
    status: "approved",
    approved_at: null,
    denied_at: null,
    last_updated: "2024-12-30T11:39:20.300395Z",
    application: {
      id: "2",
      name: "Test Application",
      version: "1.1",
      status: "approved",
      publisher: "Another Publisher",
    },
  },
];

describe("DeviceInventoryModal", () => {
  const mockQueryClient = { invalidateQueries: vi.fn() };

  beforeEach(() => {
    (useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockQueryClient
    );
  });

  it("renders error message when there is an error fetching inventory", async () => {
    const errorMessage = "Failed to load applications";
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      error: { message: errorMessage },
      data: null,
    });

    render(
      <IntlProvider locale="en">
        <DeviceInventoryModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
  });

  it("renders empty state when no inventory data is available", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: { inventory: [] },
    });

    render(
      <IntlProvider locale="en">
        <DeviceInventoryModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    await waitFor(() =>
      expect(screen.getByText(/No applications found/)).toBeTruthy()
    );
  });

  it("renders a loading indicator when data is being fetched", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: null,
    });
    render(
      <IntlProvider locale="en">
        <DeviceInventoryModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });

  it("renders inventory data when available", async () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: { inventory: mockApplications },
    });

    render(
      <IntlProvider locale="en">
        <DeviceInventoryModal deviceId="device123" token="token123" />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Application")).toBeTruthy();
      expect(screen.getByText("Another Publisher")).toBeTruthy();
    });
  });
});
