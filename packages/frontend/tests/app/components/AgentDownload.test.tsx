import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, beforeAll } from "vitest";
import AgentDownloadComponent from "@/components/agent-download/AgentDownload";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { getAgentBinaryVersions } from "@/lib/agentBinary";
import { IntlProvider } from "react-intl";
import { agentDownloadTexts } from "@/texts/agent-download/agent-download";
import AgentDownload from "@/app/agent-download/page";

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/agentBinary", () => ({
  getAgentBinaryVersions: vi
    .fn()
    .mockResolvedValue({ versions: { v1: "link1", v2: "link2" } }),
  getLatestAgentBinaryLink: vi
    .fn()
    .mockResolvedValue("https://example.com/latest-agent"),
}));

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

describe("Agent Download", () => {
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockToast = vi.fn();
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: mockToast,
      toasts: [],
    });
    vi.clearAllMocks();
  });

  it("renders ProtectedRoute and AgentComponent correctly", async () => {
    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <AgentDownload />
        </IntlProvider>
      );
    });

    const componentText = screen.getByText("Welcome to MemCrypt!");
    expect(componentText).to.exist;
  });
});

describe("AgentDownloadComponent", () => {
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockToast = vi.fn();
    const toastReturnValue = { toast: mockToast, toasts: [] };

    (useToast as ReturnType<typeof vi.fn>).mockReturnValue(toastReturnValue);
    vi.clearAllMocks();
  });

  it("should render the component for authenticated users", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1" },
      accessToken: "token",
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <AgentDownloadComponent />
        </IntlProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Download")).toBeTruthy();
    });
  });

  it("should handle empty versions gracefully", async () => {
    // Mock an empty response for versions
    (getAgentBinaryVersions as ReturnType<typeof vi.fn>).mockResolvedValue({
      versions: {},
    });

    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1" },
      accessToken: "token",
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <AgentDownloadComponent />
        </IntlProvider>
      );
    });
    await waitFor(() => {
      expect(
        screen.getByText("Download Other Agent Binary Versions")
      ).toBeTruthy();
    });
  });
  it("should render the download button and handle click", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve({ versions: { version1: "link" } }),
    } as Response);

    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentDownloadComponent />
      </IntlProvider>
    );

    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1" },
      accessToken: "token",
    });

    const downloadButton = await screen.findByRole("button", {
      name: /Download/i,
    });
    await act(async () => {
      fireEvent.click(downloadButton);
    });

    await act(async () => {
      expect(mockToast).toHaveBeenCalledWith({
        title: agentDownloadTexts.downloadStarted.defaultMessage,
        description:
          agentDownloadTexts.downloadStartedDescription.defaultMessage,
      });
    });
  });

  it("should handle empty agent binary versions gracefully", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1" },
      accessToken: "token",
    });

    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentDownloadComponent />
      </IntlProvider>
    );

    await waitFor(() =>
      screen.getByText(
        agentDownloadTexts.downloadOtherVersionsTitle.defaultMessage
      )
    );

    fireEvent.click(
      screen.getByText(
        agentDownloadTexts.downloadOtherVersionsTitle.defaultMessage
      )
    );

    expect(screen.getByText("No other versions available")).toBeTruthy();
  });

  it("should return null if user is not authenticated", async () => {
    (useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      accessToken: null,
    });

    await act(async () => {
      render(
        <IntlProvider locale="en" messages={{}}>
          <AgentDownloadComponent />
        </IntlProvider>
      );
    });

    expect(
      screen.queryByText(agentDownloadTexts.welcomeTitle.defaultMessage)
    ).toBeNull();
  });
});
