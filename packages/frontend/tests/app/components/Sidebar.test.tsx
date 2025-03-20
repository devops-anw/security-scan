import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntlProvider } from "react-intl";
import Sidebar from "@/components/sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

// Mocking usePathname hook and other dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const messages = {
  en: {
    "sidebar.approvalRequests": "Approval Requests",
    "sidebar.users": "Users",
    "sidebar.agentBinary": "Agent Binary",
    "sidebar.dashboard": "Dashboard",
    "sidebar.orgProfile": "Org Profile",
    "sidebar.deviceMonitor": "Device Monitor",
    "sidebar.agentDownload": "Agent Download",
    "sidebar.applications": "Applications",
    "sidebar.activityLogs": "Activity Logs",
    "sidebar.recovery": "Recovery",
    "sidebar.tools": "Tools",
    "sidebar.help": "Help",
  },
};

// Updated function to render Sidebar with different session states
const renderSidebarWithSession = (session: any) => {
  return render(
    <SessionProvider session={session}>
      <IntlProvider locale="en" messages={messages.en}>
        <Sidebar isVisible={true} />
      </IntlProvider>
    </SessionProvider>
  );
};

describe("Sidebar", () => {
  beforeEach(() => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard"); // Mock pathname for default tests
  });

  it("does not render RoleBasedRoute links for unauthorized users", () => {
    const session = null;
    renderSidebarWithSession(session);
    expect(screen.queryByText("Approval Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("renders the sidebar when not on login or signup page", () => {
    const session = { user: { type: "Org Admin" } };

    renderSidebarWithSession(session);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Org Profile")).toBeInTheDocument();
    expect(screen.getByText("Device Monitor")).toBeInTheDocument();
    expect(screen.getByText("Applications")).toBeInTheDocument();
  });

  it("does not render the sidebar when on login or signup page", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/login");
    const session = { user: { type: "Org Admin" } };
    renderSidebarWithSession(session);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Org Profile")).not.toBeInTheDocument();
  });

  it("renders collapsed state of the sidebar correctly", () => {
    const session = { user: { type: "Org Admin" } };
    renderSidebarWithSession(session);
    const collapseButton = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(collapseButton);
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
  });

  it("toggles the sidebar collapse on click", async () => {
    const session = { user: { type: "Org Admin" } };
    renderSidebarWithSession(session);
    const collapseButton = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(collapseButton);
    await waitFor(() => {
      expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("Expand sidebar"));
    await waitFor(() => {
      expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
    });
  });

  it("renders RoleBasedRoute links correctly for Platform Admin", () => {
    const session = { user: { type: "Platform Admin" } };
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/admin/users");
    renderSidebarWithSession(session);
    expect(screen.getByText("Approval Requests")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Agent Binary")).toBeInTheDocument();
  });

  it("renders RoleBasedRoute links correctly for Org Admin", () => {
    const session = { user: { type: "Org Admin" } };
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    renderSidebarWithSession(session);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Org Profile")).toBeInTheDocument();
    expect(screen.getByText("Device Monitor")).toBeInTheDocument();
    expect(screen.getByText("Agent Download")).toBeInTheDocument();
  });

  it("does not render RoleBasedRoute links for unauthorized users", () => {
    const session = null;
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    renderSidebarWithSession(session);
    expect(screen.queryByText("Approval Requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });
});
