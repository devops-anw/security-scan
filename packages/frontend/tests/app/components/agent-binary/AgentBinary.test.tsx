import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";

import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import * as agentBinaryLib from "@/lib/agentBinary"; // Mock the API call
import AgentBinary from "@/components/agent-binary/AgentBinary";
import { IntlProvider } from "react-intl";

// Mocking hooks and modules
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn(),
}));
vi.mock("@/lib/agentBinary", () => ({
  getAgentBinaryVersions: vi.fn(),
}));

describe("AgentBinary Component", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      accessToken: "mock-token",
      type: "Platform Admin",
    });

    (
      agentBinaryLib.getAgentBinaryVersions as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      versions: {
        v1: [
          { filename: "file1", version: "v1" },
          { filename: "file2", version: "v1" },
        ],
        v2: [{ filename: "file3", version: "v2" }],
      },
    });
  });

  it("should render the component", async () => {
    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <AgentBinary />
        </IntlProvider>
      );
    });

    expect(screen.getByText("Upload New Version")).toBeTruthy();
    expect(screen.getByText("Agent Binary Versions")).toBeTruthy();
  });

  it("should redirect to login if the user is not a Platform Admin", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      isAuthenticated: true,
      accessToken: "mock-token",
      type: "User",
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinary />
      </IntlProvider>
    );

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
  });
});
