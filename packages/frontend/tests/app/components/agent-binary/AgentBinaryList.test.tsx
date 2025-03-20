import { describe, expect, it, vi } from "vitest";

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IntlProvider } from "react-intl";
import { AgentBinaryList } from "@/components/agent-binary/AgentBinaryList";

import AgentManagementPage from "@/app/admin/agent-binary/page";

vi.mock("@tanstack/react-query");
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

// Mock AgentBinary component
vi.mock("@/components/agent-binary/AgentBinary", () => ({
  __esModule: true,
  default: () => <div>Agent Binary Component</div>,
}));

describe("AgentManagementPage", () => {
  it("renders the AgentBinary component inside ProtectedRoute", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentManagementPage />
      </IntlProvider>
    );

    // Check if the AgentBinary component is rendered
    expect(screen.getByText("Agent Binary Component")).toBeInTheDocument();

    // Check if ProtectedRoute is applied (children are rendered correctly)
    expect(screen.getByText("Agent Binary Component")).toBeInTheDocument();
  });
});

describe("AgentBinaryList Component", () => {
  const mockVersions = {
    "1.0.0": [
      { filename: "file1.bin", download_link: "/download/file1" },
      { filename: "file2.bin", download_link: "/download/file2" },
    ],
    "1.1.0": [{ filename: "file3.bin", download_link: "/download/file3" }],
  };

  it("renders the correct versions", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryList versions={mockVersions} />
      </IntlProvider>
    );

    expect(screen.getByText("Version: 1.0.0")).toBeInTheDocument();
    expect(screen.getByText("Version: 1.1.0")).toBeInTheDocument();
  });

  it("filters versions and files based on search term", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryList versions={mockVersions} />
      </IntlProvider>
    );

    const searchInput = screen.getByPlaceholderText(
      "Search by version or file name..."
    );
    fireEvent.change(searchInput, { target: { value: "file1" } });

    expect(screen.getByText("Version: 1.0.0")).toBeInTheDocument();
    expect(screen.queryByText("Version: 1.1.0")).not.toBeInTheDocument();
  });

  it("expands a version when clicked", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryList versions={mockVersions} />
      </IntlProvider>
    );

    const versionTitle = screen.getByText("Version: 1.0.0");
    fireEvent.click(versionTitle);

    expect(screen.getByText("file1.bin")).toBeInTheDocument();
    expect(screen.getByText("file2.bin")).toBeInTheDocument();
  });

  it("shows no matching versions message when no search results", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryList versions={mockVersions} />
      </IntlProvider>
    );

    const searchInput = screen.getByPlaceholderText(
      "Search by version or file name..."
    );
    fireEvent.change(searchInput, { target: { value: "non-existent-file" } });

    expect(
      screen.getByText("No matching versions or files found.")
    ).toBeInTheDocument();
  });
});
