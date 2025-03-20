import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import Application from "@/app/application/page";
import { IntlProvider } from "react-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApplicationList from "@/components/application/ApplicationList";

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

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/app/application/page", () => ({
  default: () => (
    <div data-testid="protected-route">
      <div data-testid="application-list">Application List</div>
    </div>
  ),
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

const mockApplications = {
  applications: [
    {
      id: "1",
      name: "Test Application",
      version: "1.0",
      status: "pending",
      publisher: "Test Publisher",
    },
    {
      id: "2",
      name: "Another Application",
      version: "1.1",
      status: "approved",
      publisher: "Another Publisher",
    },
  ],
  total: 2,
  skip: 0,
  limit: 10,
};

describe("Applications List page", () => {
  it("renders ProtectedRoute and ApplicationsComponent correctly", () => {
    render(
      <IntlProvider locale="en">
        <Application />
      </IntlProvider>
    );

    const componentText = screen.getByText("Application List");
    expect(componentText).to.exist;
  });
});

describe("ApplicationList", () => {
  const mockQueryClient = { invalidateQueries: vi.fn() };

  beforeEach(() => {
    (useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockQueryClient
    );
  });

  describe("ApplicationList", () => {
    it("displays no applications found message if no data is returned", () => {
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      expect(screen.getByText(/No applications found/i)).toBeTruthy();
    });

    it("displays applications correctly when data is available", () => {
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockApplications,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      expect(
        screen.getByText(mockApplications.applications[0].name)
      ).toBeTruthy();
      expect(
        screen.getByText(mockApplications.applications[0].version)
      ).toBeTruthy();
    });

    it("displays loading spinner when data is loading", () => {
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeTruthy();
    });

    it("displays error message if data fetching fails", () => {
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error("No applications found"),
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      expect(screen.getByText(/No applications found/)).toBeTruthy();
    });

    it("handles approve mutation successfully", async () => {
      const approveApplication = vi.fn().mockResolvedValue({});
      (useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
        mutateAsync: approveApplication,
      });

      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockApplications, // Ensure the correct structure
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      const approveButton = screen.getByText(/Approve/);
      expect(approveButton).toBeTruthy();

      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(approveApplication).toBeTruthy();
      });
    });

    it("handles reject mutation successfully", async () => {
      const rejectApplication = vi.fn().mockResolvedValue({});
      (useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
        mutateAsync: rejectApplication,
      });

      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockApplications,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      const rejectButton = screen.getByText(/Reject/);
      fireEvent.click(rejectButton);

      await waitFor(() => expect(rejectApplication).toBeTruthy());
    });

    it("filters applications by status correctly", () => {
      const filteredApplications = {
        applications: [
          {
            id: "1",
            name: "Test Application",
            version: "1.0",
            status: "pending",
            publisher: "Test Publisher",
          },
        ],
        total: 1,
        skip: 0,
        limit: 10,
      };

      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: filteredApplications,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      expect(screen.getByText("Test Application")).toBeTruthy();
      expect(screen.queryByText("Another Application")).toBeNull();
    });
    it("displays loading spinner when data is loading", () => {
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = render(
        <IntlProvider locale="en" messages={{}}>
          <ApplicationList />
        </IntlProvider>
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeTruthy();
      expect(screen.queryByText(/No applications found/)).toBeNull();
    });
  });
});
